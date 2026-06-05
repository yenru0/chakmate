import { AppState } from '../main.js';
import { dataLayer } from '../shared/dataLayer.js';
import { categories } from '../shared/categories.js';
import { renderAchievementCard } from '../shared/achievements.js';

document.addEventListener('DOMContentLoaded', async () => {
  let gamification = await AppState.getGamificationData();
  let totalMoved = await AppState.getTotalMoved();
  let totalTrashed = await AppState.getTotalTrashed();
  let scan = await dataLayer.getScan();

  function updateStats() {
    const stats = scan.stats || {};
    const groups = scan.groups || {};
    const folderKeys = Object.keys(groups).filter((k) => k !== 'unclassified');
    const topGroups = folderKeys
      .map((k) => ({ name: k, count: groups[k].length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    document.getElementById('streak-count').textContent = gamification.streak || 0;
    document.getElementById('files-count').textContent = totalMoved;
    document.getElementById('folders-count').textContent = totalMoved > 0 ? folderKeys.length : 0;

    let movedEl = document.getElementById('moved-count');
    if (!movedEl) {
      movedEl = document.createElement('div');
      movedEl.id = 'moved-count';
      movedEl.className = 'text-xs text-text-muted text-center mt-1';
      const foldersEl = document.getElementById('folders-count');
      if (foldersEl && foldersEl.parentElement) foldersEl.parentElement.appendChild(movedEl);
    }
    movedEl.textContent = totalTrashed > 0 ? `(휴지통: ${totalTrashed}개)` : '';

    const container = document.getElementById('suggestions-list');
    if (container) {
      if (topGroups.length === 0) {
        container.innerHTML = `<div class="text-center text-text-muted py-4 text-sm">분류된 폴더가 없습니다. 시각화 페이지에서 파일을 정리하세요.</div>`;
      } else {
        container.innerHTML = topGroups.map((g) => {
          const label = categories.labelForFolder(g.name);
          return `
          <div class="suggestion-item flex items-center gap-3 p-3 bg-surface-secondary rounded-[12px] cursor-pointer border-2 border-transparent transition-all duration-150 hover:bg-overlay hover:border-primary-light" data-folder="${g.name}">
            <div class="suggestion-checkbox w-6 h-6 border-2 border-text-muted rounded-[8px] flex items-center justify-center flex-shrink-0 transition-all duration-150">
            </div>
            <div class="suggestion-content flex-1">
              <div class="suggestion-name font-medium mb-0.5">${label}</div>
              <div class="suggestion-detail text-sm text-text-secondary">${g.count} files</div>
            </div>
            <svg class="suggestion-arrow w-5 h-5 stroke-text-muted fill-none"><use href="../assets/icons/icons.svg#icon-chevron-right"></use></svg>
          </div>
        `;
        }).join('');
        container.querySelectorAll('.suggestion-item').forEach((item) => {
          item.addEventListener('click', () => {
            window.location.href = 'scene_visualization.html';
          });
        });
      }
    }
  }

  function renderAchievements() {
    const container = document.getElementById('achievements-grid');
    if (!container) return;
    const achievements = gamification.achievements || [];
    container.innerHTML = achievements.slice(0, 8).map((a) => renderAchievementCard(a, { size: 'sm' })).join('');
  }

  updateStats();
  renderAchievements();

  const unsub = dataLayer.subscribe(async () => {
    scan = await dataLayer.getScan();
    [totalMoved, totalTrashed, gamification] = await Promise.all([
      AppState.getTotalMoved(),
      AppState.getTotalTrashed(),
      AppState.getGamificationData(),
    ]);
    updateStats();
    renderAchievements();
  });

  document.getElementById('apply-suggestions')?.addEventListener('click', () => {
    window.location.href = 'scene_visualization.html';
  });

  window.addEventListener('beforeunload', () => unsub());
});
