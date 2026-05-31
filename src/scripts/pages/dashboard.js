import { SUGGESTIONS, ACHIEVEMENTS, AppState, getStats } from '../main.js';

document.addEventListener('DOMContentLoaded', async () => {
  const state = {
    streak: await AppState.getStreak(),
    filesOrganized: await AppState.getFilesOrganized(),
    foldersManaged: await AppState.getFoldersManaged()
  };

  const suggestions = [
    { name: 'Photos to 2024', detail: '2 files moved', selected: false },
    { name: 'Docs to quarterly', detail: '3 files moved', selected: true },
    { name: 'Archives to storage', detail: '1 files moved', selected: false }
  ];

  const achievements = [
    { name: 'First Sort', icon: 'trophy', color: 'gold', unlocked: true },
    { name: '7-Day Streak', icon: 'fire', color: 'gold', unlocked: true },
    { name: 'File Master', icon: 'folder', color: 'silver', unlocked: true },
    { name: 'Organizer Pro', icon: 'star', color: 'silver', unlocked: true },
    { name: '30-Day Streak', icon: 'star', color: 'gold', unlocked: false },
    { name: 'AI User', icon: 'sparkles', color: 'bronze', unlocked: false },
    { name: 'Organized King', icon: 'folder', color: 'silver', unlocked: false },
    { name: 'Creative', icon: 'light-bulb', color: 'bronze', unlocked: false }
  ];

  function renderSuggestions() {
    const container = document.getElementById('suggestions-list');
    if (!container) return;

    container.innerHTML = suggestions.map((s, i) => `
      <div class="suggestion-item flex items-center gap-3 p-3 bg-surface-secondary rounded-[12px] cursor-pointer border-2 border-transparent transition-all duration-150 ${s.selected ? 'bg-primary/10 border-primary' : 'hover:bg-overlay hover:border-primary-light'}" data-index="${i}">
        <div class="suggestion-checkbox w-6 h-6 border-2 ${s.selected ? 'bg-primary border-primary' : 'border-text-muted'} rounded-[8px] flex items-center justify-center flex-shrink-0 transition-all duration-150">
          <svg class="w-3.5 h-3.5 stroke-white fill-none ${s.selected ? 'opacity-100' : 'opacity-0'} transition-opacity duration-150"><use href="../assets/icons/icons.svg#icon-check"></use></svg>
        </div>
        <div class="suggestion-content flex-1">
          <div class="suggestion-name font-medium mb-0.5">${s.name}</div>
          <div class="suggestion-detail text-sm text-text-secondary">${s.detail}</div>
        </div>
        <svg class="suggestion-arrow w-5 h-5 stroke-text-muted fill-none"><use href="../assets/icons/icons.svg#icon-chevron-right"></use></svg>
      </div>
    `).join('');

    container.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index);
        suggestions[idx].selected = !suggestions[idx].selected;
        renderSuggestions();
      });
    });
  }

  function renderAchievements() {
    const container = document.getElementById('achievements-grid');
    if (!container) return;

    container.innerHTML = achievements.map(a => `
      <div class="achievement aspect-square bg-surface-secondary rounded-[12px] flex flex-col items-center justify-center gap-1 p-2 transition-all duration-250 cursor-pointer hover:scale-105 ${a.unlocked ? '' : 'opacity-40 grayscale'}">
        <div class="achievement-icon w-9 h-9 rounded-[8px] flex items-center justify-center ${a.unlocked ? a.color === 'gold' ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : a.color === 'silver' ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' : 'bg-gradient-to-br from-amber-700 to-amber-900 text-white' : 'bg-overlay text-primary'}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5"><use href="../assets/icons/icons.svg#icon-${a.icon}"></use></svg>
        </div>
        <div class="achievement-name text-[10px] text-center text-text-secondary">${a.name}</div>
      </div>
    `).join('');
  }

  document.getElementById('apply-suggestions')?.addEventListener('click', () => {
    const selected = suggestions.filter(s => s.selected);
    if (selected.length > 0) {
      window.location.href = 'scene_swipe.html';
    }
  });

  document.getElementById('streak-count').textContent = state.streak;
  document.getElementById('files-count').textContent = state.filesOrganized;
  document.getElementById('folders-count').textContent = state.foldersManaged;

  renderSuggestions();
  renderAchievements();
});