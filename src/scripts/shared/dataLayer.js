import { AppState } from './state.js';
import { mkdir, exists, rename } from '@tauri-apps/plugin-fs';
import { Store } from '@tauri-apps/plugin-store';
import { scanDirectory } from './fileScanner.js';
import { classifyFiles, groupFilesByTargetFolder, computeStats, getExtension, buildTargetPath } from './util.js';
import { categories } from './categories.js';
import { achievements } from './achievements.js';
import { info, warn, error, debug } from './logger.js';

const CACHE = {
  scanPath: null,
  scan: null,
  lastFetched: 0,
};

const TTL_MS = 30_000;
const SUBSCRIBERS = new Set();
const STORE_PATH = 'chakmate-data.json';
const SCAN_KEY_PREFIX = 'scan:';
const SCAN_VERSION = 1;

function normalizePath(p) {
  if (!p) return p;
  let s = p;
  while (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1);
  return s;
}

let storeInstance = null;
async function getStore() {
  if (storeInstance) return storeInstance;
  storeInstance = await Store.load(STORE_PATH, {
    autoSave: true,
    defaults: {},
  });
  return storeInstance;
}

function scanKey(scanPath) {
  return SCAN_KEY_PREFIX + scanPath;
}

function isStale() {
  return Date.now() - CACHE.lastFetched > TTL_MS;
}

function emptyScan(scanPath = null) {
  return {
    version: SCAN_VERSION,
    scanPath,
    scannedAt: 0,
    files: [],
    groups: { unclassified: [] },
    stats: { totalCount: 0, classifiedCount: 0, unclassifiedCount: 0, byCategory: {} },
  };
}

function notify() {
  SUBSCRIBERS.forEach((fn) => {
    try {
      fn(CACHE.scan);
    } catch (e) {
      console.error('[dataLayer] subscriber error:', e);
    }
  });
}

async function readScanFromStore(scanPath) {
  try {
    const s = await getStore();
    const data = await s.get(scanKey(scanPath));
    if (data && data.scanPath === scanPath && data.version === SCAN_VERSION) {
      return data;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function writeScanToStore(scanPath, data) {
  try {
    const s = await getStore();
    await s.set(scanKey(scanPath), data);
  } catch (e) {
  }
}

export const dataLayer = {
  async getScanPath() {
    if (CACHE.scanPath !== null) return CACHE.scanPath;
    const raw = await AppState.getScanPath();
    CACHE.scanPath = normalizePath(raw);
    info(`[dataLayer] getScanPath from AppState: ${CACHE.scanPath} (raw: ${raw})`);
    return CACHE.scanPath;
  },

  async setScanPath(path) {
    const normalized = normalizePath(path);
    info(`[dataLayer] setScanPath: ${normalized} (input: ${path})`);
    await AppState.setScanPath(normalized);
    CACHE.scanPath = normalized;
    CACHE.scan = null;
    CACHE.lastFetched = 0;
    notify();
    try { await this.touchStreak(); } catch (e) {}
  },

  async touchStreak() {
    const gamification = await AppState.getGamificationData();
    const today = new Date().toISOString().split('T')[0];
    const lastDate = gamification.lastActiveDate || '';

    if (lastDate === today) return gamification;

    let newStreak;
    if (lastDate === '') {
      newStreak = 1;
    } else {
      const last = new Date(lastDate);
      const now = new Date(today);
      const daysDiff = Math.floor((now - last) / 86400000);
      newStreak = daysDiff === 1 ? (gamification.streak || 0) + 1 : 1;
    }

    gamification.streak = newStreak;
    gamification.lastActiveDate = today;

    if (!Array.isArray(gamification.weeklyProgress) || gamification.weeklyProgress.length !== 7) {
      gamification.weeklyProgress = [false, false, false, false, false, false, false];
    }
    const dayIndex = (new Date(today).getDay() + 6) % 7;
    gamification.weeklyProgress[dayIndex] = true;

    gamification.lastUpdated = new Date().toISOString();
    await AppState.setGamificationData(gamification);

    const ctx = await achievements.getContext();
    await achievements.evaluate(ctx);
    return gamification;
  },

  async getScan({ force = false } = {}) {
    if (!force && CACHE.scan && !isStale()) {
      info(`[dataLayer] getScan: cache hit, files=${CACHE.scan.files?.length}`);
      return CACHE.scan;
    }
    const scanPath = await this.getScanPath();
    info(`[dataLayer] getScan: scanPath=${scanPath} force=${force}`);
    if (!scanPath) {
      info('[dataLayer] getScan: no scanPath');
      CACHE.scan = emptyScan();
      CACHE.lastFetched = Date.now();
      return CACHE.scan;
    }

    if (!force) {
      const stored = await readScanFromStore(scanPath);
      const storedFileCount = stored?.files?.length || 0;
      info(`[dataLayer] getScan: store read result=${stored ? `scan with ${storedFileCount} files` : 'null'}`);
      if (stored && storedFileCount > 0) {
        CACHE.scan = stored;
        CACHE.lastFetched = Date.now();
        return CACHE.scan;
      }
      if (stored && storedFileCount === 0) {
        info('[dataLayer] getScan: stored scan is empty, forcing rescan');
      }
    }

    try {
      const rawFiles = await scanDirectory(scanPath);
      info(`[dataLayer] getScan: scanDirectory returned ${rawFiles.length} files from ${scanPath}`);
      const files = classifyFiles(rawFiles);
      const scan = {
        version: SCAN_VERSION,
        scanPath,
        scannedAt: Date.now(),
        files,
        groups: groupFilesByTargetFolder(files),
        stats: computeStats(files),
      };
      await writeScanToStore(scanPath, scan);
      CACHE.scan = scan;
      CACHE.lastFetched = Date.now();
      return CACHE.scan;
    } catch (e) {
      error(`[dataLayer] getScan failed: ${e?.message || e}`);
      CACHE.scan = emptyScan(scanPath);
      CACHE.lastFetched = Date.now();
      return CACHE.scan;
    }
  },

  subscribe(fn) {
    SUBSCRIBERS.add(fn);
    return () => SUBSCRIBERS.delete(fn);
  },

  async setFileTarget(path, targetFolder) {
    if (!CACHE.scan || !CACHE.scanPath) return false;
    const file = CACHE.scan.files.find((f) => f.path === path);
    if (!file) return false;
    file.targetFolder = targetFolder;
    file.targetPath = buildTargetPath(file.path, targetFolder);
    if (CACHE.scan.groups) {
      for (const key of Object.keys(CACHE.scan.groups)) {
        CACHE.scan.groups[key] = CACHE.scan.groups[key].filter((f) => f.path !== path);
      }
      const newKey = targetFolder || 'unclassified';
      if (!CACHE.scan.groups[newKey]) CACHE.scan.groups[newKey] = [];
      CACHE.scan.groups[newKey].push(file);
    }
    await writeScanToStore(CACHE.scanPath, CACHE.scan);
    notify();
    try { await this.touchStreak(); } catch (e) {}
    return true;
  },

  async markAsTrash(path) {
    return this.setFileTarget(path, 'Chak__Trash');
  },

  async unmarkTrash(path) {
    if (!CACHE.scan) return false;
    const file = CACHE.scan.files.find((f) => f.path === path);
    if (!file) return false;
    const cat = categories.resolve(getExtension(file.name));
    return this.setFileTarget(path, cat.folder);
  },

  async applyMoves({ filter, onProgress } = {}) {
    if (!CACHE.scan || !CACHE.scanPath) {
      return { moved: 0, skipped: 0, errors: [{ reason: 'no scan loaded' }] };
    }
    const scanPath = CACHE.scanPath;
    const files = CACHE.scan.files;
    const result = { moved: 0, skipped: 0, errors: [] };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.classified || !file.targetPath) continue;
      if (file.path === file.targetPath) continue;
      if (filter && !filter(file)) continue;

      if (onProgress) onProgress({ current: i + 1, total: files.length, file });

      const source = `${scanPath}/${file.path}`;
      const target = `${scanPath}/${file.targetPath}`;

      try {
        if (!await exists(source)) {
          result.skipped++;
          result.errors.push({ file, reason: 'source not found' });
          continue;
        }
        if (await exists(target)) {
          result.skipped++;
          result.errors.push({ file, reason: 'target already exists' });
          continue;
        }
        const targetDir = target.substring(0, target.lastIndexOf('/'));
        await mkdir(targetDir, { recursive: true });
        await rename(source, target);
        file.path = file.targetPath;
        result.moved++;
      } catch (e) {
        console.error('[dataLayer] move failed:', file.path, e);
        result.skipped++;
        result.errors.push({ file, reason: e.message || String(e) });
      }
    }

    CACHE.scan.groups = groupFilesByTargetFolder(files);
    CACHE.scan.stats = computeStats(files);

    await writeScanToStore(scanPath, CACHE.scan);

    if (result.moved > 0) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const prevTotal = await AppState.getTotalMoved();
        const prevTrashed = await AppState.getTotalTrashed();
        const prevToday = await AppState.getMovedToday();
        const trashedInBatch = files.filter((f) => f.targetFolder === 'Chak__Trash' && f.path === f.targetPath).length;

        await AppState.setTotalMoved(prevTotal + result.moved);
        await AppState.setTotalTrashed(prevTrashed + trashedInBatch);

        const newTodayCount = prevToday.date === today ? prevToday.count + result.moved : result.moved;
        await AppState.setMovedToday(today, newTodayCount);

        const folderSet = new Set(files.filter((f) => f.path === f.targetPath && f.targetFolder).map((f) => f.targetFolder));
        if (folderSet.size > 0) {
          const existing = await AppState.getUniqueFolders();
          await AppState.setUniqueFolders(Math.max(existing, folderSet.size));
        }

        const ctx = await achievements.getContext();
        await achievements.evaluate(ctx);

        try { await this.touchStreak(); } catch (e) {}
      } catch (e) {
      }
    }

    notify();
    return result;
  },

  _cache: CACHE,
  _subscribers: SUBSCRIBERS,
  _TTL_MS: TTL_MS,
};
