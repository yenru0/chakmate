import { readDir, stat } from '@tauri-apps/plugin-fs';
import { FILE_TYPES } from '../main.js';
import { info, error } from './logger.js';

export async function getFileTypeFromName(name) {
  const ext = name.split('.').pop()?.toLowerCase();
  const typeMap = {
    pdf: 'pdf', doc: 'doc', docx: 'doc', txt: 'doc',
    jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', bmp: 'image',
    mp4: 'video', mov: 'video', avi: 'video', mkv: 'video',
    xlsx: 'excel', xls: 'excel', csv: 'excel',
    pptx: 'ppt', ppt: 'ppt',
    zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive', gz: 'archive',
  };
  return typeMap[ext] || 'doc';
}

export async function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

export async function scanDirectory(path, options = {}) {
  const maxDepth = options.maxDepth ?? 10;
  const files = [];

  async function walk(dir, depth, relPath) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = await readDir(dir);
      if (depth === 0) info(`[fileScanner] readDir(${dir}) returned ${entries.length} entries`);
    } catch (e) {
      error(`[fileScanner] readDir failed: ${dir}: ${e?.message || e}`);
      throw e;
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const absPath = `${dir}/${entry.name}`;
      const relFile = relPath ? `${relPath}/${entry.name}` : entry.name;
      if (entry.isFile) {
        try {
          const fileStat = await stat(absPath);
          const type = await getFileTypeFromName(entry.name);
          files.push({
            name: entry.name,
            path: relFile,
            type,
            size: await formatFileSize(fileStat.size),
            sizeBytes: fileStat.size,
            date: new Date(fileStat.mtime * 1000).toISOString().split('T')[0],
            mtime: fileStat.mtime,
          });
        } catch (e) {
          files.push({
            name: entry.name,
            path: relFile,
            type: await getFileTypeFromName(entry.name),
            size: 'Unknown',
            sizeBytes: 0,
            date: 'Unknown',
            mtime: 0,
          });
        }
      } else if (entry.isDirectory) {
        await walk(absPath, depth + 1, relFile);
      }
    }
  }

  try {
    await walk(path, 0, '');
  } catch (e) {
    error(`[fileScanner] scanDirectory aborted: ${path}: ${e?.message || e}`);
    throw e;
  }
  info(`[fileScanner] scanDirectory(${path}) total files: ${files.length}`);
  return files;
}

export async function buildFileTree(path) {
  try {
    const entries = await readDir(path);
    const folders = [];
    const files = [];

    for (const entry of entries) {
      if (entry.isDirectory) {
        folders.push({ name: entry.name, type: 'folder', path: `${path}/${entry.name}` });
      } else {
        const fullPath = `${path}/${entry.name}`;
        const fileStat = await stat(fullPath);
        const type = await getFileTypeFromName(entry.name);
        files.push({ name: entry.name, type, meta: await formatFileSize(fileStat.size), path: fullPath });
      }
    }

    return { folders, files };
  } catch (e) {
    console.error('Failed to build file tree:', e);
    return { folders: [], files: [] };
  }
}

export function getFileTypeInfo(type) {
  return FILE_TYPES[type] || { label: 'File', color: '#6366f1', icon: 'document' };
}