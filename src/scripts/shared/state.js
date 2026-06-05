import { Store } from '@tauri-apps/plugin-store';

let store = null;

async function getStore() {
  if (!store) {
    store = await Store.load('chakmate-data.json');
  }
  return store;
}

const AppState = {
  async getTheme() {
    const s = await getStore();
    return await s.get('theme') || 'light';
  },

  async setTheme(theme) {
    const s = await getStore();
    await s.set('theme', theme);
    await s.save();
    document.documentElement.setAttribute('data-theme', theme);
  },

  async getSettings() {
    const s = await getStore();
    const defaults = {
      notifications: true,
      habits: false,
      autoOrganize: false,
      confirmDelete: true
    };
    const stored = await s.get('settings');
    if (stored) {
      return { ...defaults, ...stored };
    }
    return defaults;
  },

  async setSettings(settings) {
    const s = await getStore();
    await s.set('settings', settings);
    await s.save();
  },

  async getGamificationData() {
    const s = await getStore();
    const defaultData = {
      streak: 0,
      lastActiveDate: '',
      weeklyProgress: [false, false, false, false, false, false, false],
      achievements: [
        { id: 'first_sort', name: '첫 정리', icon: '🏆', unlocked: false, tier: 'gold', requirement: '첫 정리 세션 완료' },
        { id: 'week_warrior', name: '주간 챌린저', icon: '🌟', unlocked: false, tier: 'gold', requirement: '7일 연속 완료' },
        { id: 'streak_7', name: '7일 스트릭', icon: '🔥', unlocked: false, tier: 'silver', requirement: '7일 스트릭 유지' },
        { id: 'diamond', name: '다이아몬드', icon: '💎', unlocked: false, tier: 'gold', requirement: '30일 스트릭 유지' },
        { id: 'organizer', name: '정리 달인', icon: '📦', unlocked: false, tier: 'silver', requirement: '100개 파일 정리' },
        { id: 'minimalist', name: '미니멀리스트', icon: '✨', unlocked: false, tier: 'bronze', requirement: '50개 파일 삭제' },
        { id: 'speed_demon', name: '스피드 데몬', icon: '⚡', unlocked: false, tier: 'gold', requirement: '하루에 50개 파일 정리' },
        { id: 'collector', name: '수집가', icon: '🗂️', unlocked: false, tier: 'silver', requirement: '5개 커스텀 폴더 생성' }
      ],
      habitReminderEnabled: true,
      lastUpdated: new Date().toISOString()
    };
    const stored = await s.get('gamification');
    if (stored) {
      return { ...defaultData, ...stored };
    }
    return defaultData;
  },

  async setGamificationData(data) {
    const s = await getStore();
    data.lastUpdated = new Date().toISOString();
    await s.set('gamification', data);
    await s.save();
  },

  async getFilesOrganized() {
    const s = await getStore();
    return (await s.get('filesOrganized')) || 0;
  },

  async setFilesOrganized(count) {
    const s = await getStore();
    await s.set('filesOrganized', count);
    await s.save();
  },

  async getTotalMoved() {
    const s = await getStore();
    return (await s.get('totalMoved')) || 0;
  },

  async setTotalMoved(count) {
    const s = await getStore();
    await s.set('totalMoved', count);
    await s.save();
  },

  async getTotalTrashed() {
    const s = await getStore();
    return (await s.get('totalTrashed')) || 0;
  },

  async setTotalTrashed(count) {
    const s = await getStore();
    await s.set('totalTrashed', count);
    await s.save();
  },

  async getMovedToday() {
    const s = await getStore();
    return (await s.get('movedToday')) || { date: '', count: 0 };
  },

  async setMovedToday(date, count) {
    const s = await getStore();
    await s.set('movedToday', { date, count });
    await s.save();
  },

  async getUniqueFolders() {
    const s = await getStore();
    return (await s.get('uniqueFolders')) || 0;
  },

  async setUniqueFolders(count) {
    const s = await getStore();
    await s.set('uniqueFolders', count);
    await s.save();
  },

  async getFoldersManaged() {
    const s = await getStore();
    return (await s.get('foldersManaged')) || 0;
  },

  async setFoldersManaged(count) {
    const s = await getStore();
    await s.set('foldersManaged', count);
    await s.save();
  },

  async getScanPath() {
    const s = await getStore();
    return await s.get('scanPath') || null;
  },

  async setScanPath(path) {
    const s = await getStore();
    await s.set('scanPath', path);
    await s.save();
  },

  async isOnboardingComplete() {
    const s = await getStore();
    return (await s.get('onboardingComplete')) || false;
  },

  async setOnboardingComplete(complete) {
    const s = await getStore();
    await s.set('onboardingComplete', complete);
    await s.save();
  },

  async resetAll() {
    const s = await getStore();
    await s.clear();
    await s.save();
  },

  async init() {
    const theme = await this.getTheme();
    document.documentElement.setAttribute('data-theme', theme);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AppState.init();
});

window.AppState = AppState;
export { AppState };