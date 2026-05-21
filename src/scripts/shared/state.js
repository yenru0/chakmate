/**
 * AppState - Shared state management module
 * Handles all localStorage interactions for the Chakmate app
 */

const AppState = {
  // ============ Theme ============
  getTheme() {
    return localStorage.getItem('chackly_theme') || 'light';
  },

  setTheme(theme) {
    localStorage.setItem('chackly_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  // ============ Settings ============
  getSettings() {
    const defaults = {
      notifications: true,
      habits: false,
      autoOrganize: false,
      confirmDelete: true
    };
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem('chackly_settings') || '{}') };
    } catch {
      return defaults;
    }
  },

  setSettings(settings) {
    localStorage.setItem('chackly_settings', JSON.stringify(settings));
  },

  // ============ Gamification ============
  getGamificationData() {
    const defaultData = {
      streak: 12,
      weeklyProgress: [true, true, true, true, false, false, false],
      achievements: [
        { id: 'first_sort', name: '첫 정리', icon: '🏆', unlocked: true, tier: 'gold', requirement: '첫 정리 세션 완료' },
        { id: 'week_warrior', name: '주간 챌린저', icon: '🌟', unlocked: true, tier: 'gold', requirement: '7일 연속 완료' },
        { id: 'streak_7', name: '7일 스트릭', icon: '🔥', unlocked: true, tier: 'silver', requirement: '7일 스트릭 유지' },
        { id: 'diamond', name: '다이아몬드', icon: '💎', unlocked: true, tier: 'gold', requirement: '30일 스트릭 유지' },
        { id: 'organizer', name: '정리 달인', icon: '📦', unlocked: false, tier: 'silver', requirement: '100개 파일 정리' },
        { id: 'minimalist', name: '미니멀리스트', icon: '✨', unlocked: false, tier: 'bronze', requirement: '50개 파일 삭제' },
        { id: 'speed_demon', name: '스피드 데몬', icon: '⚡', unlocked: false, tier: 'gold', requirement: '하루에 50개 파일 정리' },
        { id: 'collector', name: '수집가', icon: '🗂️', unlocked: false, tier: 'silver', requirement: '5개 커스텀 폴더 생성' }
      ],
      habitReminderEnabled: true,
      lastUpdated: new Date().toISOString()
    };
    try {
      const stored = localStorage.getItem('chackly_gamification');
      if (stored) {
        return { ...defaultData, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return defaultData;
  },

  setGamificationData(data) {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem('chackly_gamification', JSON.stringify(data));
  },

  // ============ Dashboard Stats ============
  getStreak() {
    return parseInt(localStorage.getItem('chackly_streak') || '7');
  },

  setStreak(count) {
    localStorage.setItem('chackly_streak', count.toString());
  },

  getFilesOrganized() {
    return parseInt(localStorage.getItem('chackly_files_organized') || '248');
  },

  setFilesOrganized(count) {
    localStorage.setItem('chackly_files_organized', count.toString());
  },

  getFoldersManaged() {
    return parseInt(localStorage.getItem('chackly_folders') || '12');
  },

  setFoldersManaged(count) {
    localStorage.setItem('chackly_folders', count.toString());
  },

  // ============ Initialization ============
  init() {
    // Apply saved theme on page load
    const theme = this.getTheme();
    document.documentElement.setAttribute('data-theme', theme);
  }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  AppState.init();
});