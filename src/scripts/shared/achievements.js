import { AppState } from './state.js';

const CRITERIA = {
  first_sort: {
    check: (ctx) => ctx.totalMoved >= 1,
  },
  week_warrior: {
    check: (ctx) => ctx.streak >= 7,
  },
  streak_7: {
    check: (ctx) => ctx.streak >= 7,
  },
  diamond: {
    check: (ctx) => ctx.streak >= 30,
  },
  organizer: {
    check: (ctx) => ctx.totalMoved >= 100,
  },
  minimalist: {
    check: (ctx) => ctx.totalTrashed >= 50,
  },
  speed_demon: {
    check: (ctx) => ctx.movedToday >= 50,
  },
  collector: {
    check: (ctx) => ctx.uniqueFolders >= 5,
  },
};

const ICON_MAP = {
  '🏆': 'star',
  '🌟': 'star',
  '🔥': 'fire',
  '💎': 'sparkles',
  '📦': 'folder',
  '✨': 'sparkles',
  '⚡': 'bolt',
  '🗂️': 'folder',
};

export function achievementIconName(emoji) {
  return ICON_MAP[emoji] || 'star';
}

export const achievements = {
  async evaluate(ctx = {}) {
    const gamification = await AppState.getGamificationData();
    let newlyUnlocked = [];
    let changed = false;
    for (const a of gamification.achievements) {
      if (a.unlocked) continue;
      const criterion = CRITERIA[a.id];
      if (criterion?.check(ctx)) {
        a.unlocked = true;
        newlyUnlocked.push(a);
        changed = true;
      }
    }
    if (changed) {
      gamification.lastUpdated = new Date().toISOString();
      await AppState.setGamificationData(gamification);
    }
    return { gamification, newlyUnlocked };
  },

  async getContext() {
    const [totalMoved, totalTrashed, movedToday, uniqueFolders, gamification] = await Promise.all([
      AppState.getTotalMoved(),
      AppState.getTotalTrashed(),
      AppState.getMovedToday(),
      AppState.getUniqueFolders(),
      AppState.getGamificationData(),
    ]);
    return {
      totalMoved,
      totalTrashed,
      movedToday: movedToday.date === new Date().toISOString().split('T')[0] ? movedToday.count : 0,
      uniqueFolders,
      streak: gamification.streak || 0,
    };
  },
};

const SIZE_CONFIG = {
  sm: { icon: 'ach-icon--sm', name: 'ach-name--sm', tier: '' },
  md: { icon: 'ach-icon--md', name: 'ach-name--md', tier: 'ach-tier--md' },
};

function tierIconClass(unlocked, tier) {
  if (!unlocked) return 'ach-icon ach-icon--locked';
  if (tier === 'silver') return 'ach-icon ach-icon--silver';
  if (tier === 'bronze') return 'ach-icon ach-icon--bronze';
  return 'ach-icon ach-icon--gold';
}

export function renderAchievementCard(a, options = {}) {
  const size = options.size || 'md';
  const cfg = SIZE_CONFIG[size];
  const iconName = achievementIconName(a.icon);
  const stateClass = a.unlocked ? '' : 'ach-card--locked';
  const tierClass = tierIconClass(a.unlocked, a.tier);

  return `
    <div class="ach-card ${stateClass}" data-id="${a.id}">
      <div class="${cfg.icon} ${tierClass}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <use href="../assets/icons/icons.svg#icon-${iconName}"></use>
        </svg>
      </div>
      <div class="ach-name ${cfg.name}">${a.name}</div>
      ${size === 'md' && a.unlocked ? `<div class="ach-tier ${cfg.tier}">${a.tier}</div>` : ''}
    </div>
  `;
}

export function attachAchievementClickHandlers(container, onClick) {
  if (!container) return;
  container.addEventListener('click', (e) => {
    const card = e.target.closest('.achievement');
    if (!card) return;
    const id = card.dataset.id;
    if (id && onClick) onClick(id, card);
  });
}
