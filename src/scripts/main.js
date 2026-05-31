import { AppState } from './shared/state.js';

export const FILE_TYPES = {
  pdf: { label: 'PDF', color: '#ef4444', icon: 'document' },
  doc: { label: 'Doc', color: '#3b82f6', icon: 'document' },
  image: { label: 'Image', color: '#8b5cf6', icon: 'image' },
  video: { label: 'Video', color: '#ec4899', icon: 'image' },
  excel: { label: 'Excel', color: '#10b981', icon: 'chart-bar' },
  ppt: { label: 'PPT', color: '#f97316', icon: 'document' },
  archive: { label: 'Archive', color: '#6b7280', icon: 'folder' },
};

export function getFileTypeInfo(type) {
  return FILE_TYPES[type] || { label: 'File', color: '#6366f1', icon: 'document' };
}

export const SUGGESTIONS = [
  { name: 'Photos to 2024', detail: '2 files moved', selected: false },
  { name: 'Docs to quarterly', detail: '3 files moved', selected: true },
  { name: 'Archives to storage', detail: '1 files moved', selected: false }
];

export const ACHIEVEMENTS = [
  { id: 'first_sort', name: 'First Sort', icon: 'trophy', color: 'gold', unlocked: true, tier: 'gold', requirement: 'Complete first sort session' },
  { id: 'week_warrior', name: 'Week Warrior', icon: 'star', color: 'gold', unlocked: true, tier: 'gold', requirement: '7 days consecutive' },
  { id: 'streak_7', name: '7-Day Streak', icon: 'fire', color: 'silver', unlocked: true, tier: 'silver', requirement: 'Maintain 7-day streak' },
  { id: 'diamond', name: 'Diamond', icon: 'star', color: 'gold', unlocked: true, tier: 'gold', requirement: 'Maintain 30-day streak' },
  { id: 'organizer', name: 'Organizer Pro', icon: 'folder', color: 'silver', unlocked: false, tier: 'silver', requirement: 'Organize 100 files' },
  { id: 'minimalist', name: 'Minimalist', icon: 'sparkles', color: 'bronze', unlocked: false, tier: 'bronze', requirement: 'Delete 50 files' },
  { id: 'speed_demon', name: 'Speed Demon', icon: 'bolt', color: 'gold', unlocked: false, tier: 'gold', requirement: 'Organize 50 files in one day' },
  { id: 'collector', name: 'Collector', icon: 'folder', color: 'silver', unlocked: false, tier: 'silver', requirement: 'Create 5 custom folders' }
];

export const MOTIVATIONAL_MESSAGES = [
  "Keep the fire burning!",
  "It's on fire today!",
  "Amazing consistency!",
  "Nobody can stop you!",
  "Champion's actions!"
];

export const DAILY_TIPS = [
  { text: "Small steps lead to big changes! Invest just 5 minutes today.", author: "Daily Motivation" },
  { text: "A tidy space creates a tidy mind. Start small!", author: "Organizing Wisdom" },
  { text: "Every organized file is progress. Celebrate it!", author: "Achievement" },
  { text: "Future you will thank you for organizing today.", author: "Time Traveler" },
  { text: "Consistency achieves perfection. Keep going!", author: "Habit Master" }
];

export async function getStats() {
  return {
    streak: await AppState.getStreak(),
    filesOrganized: await AppState.getFilesOrganized(),
    foldersManaged: await AppState.getFoldersManaged()
  };
}

export { AppState };