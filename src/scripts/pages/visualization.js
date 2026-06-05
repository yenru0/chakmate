import { dataLayer } from '../shared/dataLayer.js';
import { categories } from '../shared/categories.js';

const FOLDER_ICON_COLORS = {
  Chak__Images: '#8b5cf6',
  Chak__Documents: '#3b82f6',
  Chak__Videos: '#ec4899',
  Chak__Audio: '#f59e0b',
  Chak__Archives: '#6b7280',
  Chak__Spreadsheets: '#10b981',
  Chak__Presentations: '#f97316',
  Chak__Code: '#06b6d4',
  Chak__Trash: '#ef4444',
};

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function fileIcon(file) {
  if (file.targetFolder === 'Chak__Trash') {
    return `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>`;
  }
  return `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
}

function renderBeforeTree(files) {
  const before = document.getElementById('beforeTree');
  if (!before) return;
  const pending = files.filter((f) => f.path !== f.targetPath);
  if (pending.length === 0) {
    before.innerHTML = `<div class="text-center text-text-muted py-8 text-sm">정리할 파일이 없습니다. 모두 정리됨 ✓</div>`;
    return;
  }
  const preview = pending.slice(0, 5);
  const more = pending.length - preview.length;
  before.innerHTML = `
    <details class="bg-surface-card rounded-xl border border-surface-secondary overflow-hidden">
      <summary class="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-text-primary cursor-pointer hover:bg-surface-secondary select-none">
        <svg class="w-4 h-4 transition-transform group-open:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
        <span class="flex-1">현재 폴더 (대기 중)</span>
        <span class="text-xs text-text-muted">${pending.length}개</span>
      </summary>
      <ul class="px-3 pb-2 space-y-1 text-sm">
        ${preview.map((f) => `
          <li class="flex items-center gap-2 px-2 py-1 rounded-md text-text-secondary">
            ${fileIcon(f)}
            <span class="truncate">${escapeHtml(f.path)}</span>
          </li>
        `).join('')}
        ${more > 0 ? `<li class="text-text-muted text-xs px-2 py-1">+ ${more} more</li>` : ''}
      </ul>
    </details>
  `;
}

function renderAfterTree(scan) {
  const after = document.getElementById('afterTree');
  if (!after) return;
  const groups = scan.groups || {};
  const folderKeys = Object.keys(groups).filter((k) => k !== 'unclassified');
  const unclassified = groups.unclassified || [];
  if (folderKeys.length === 0 && unclassified.length === 0) {
    after.innerHTML = `<div class="text-center text-text-muted py-8 text-sm">분류된 파일이 없습니다</div>`;
    return;
  }
  after.innerHTML = folderKeys.map((folder) => {
    const files = groups[folder] || [];
    const color = FOLDER_ICON_COLORS[folder] || '#3b82f6';
    const label = categories.labelForFolder(folder);
    return `
      <details class="group mb-2 bg-surface-card rounded-xl border border-surface-secondary overflow-hidden">
        <summary class="flex items-center gap-2 px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-surface-secondary select-none" style="color: ${color}">
          <svg class="w-4 h-4 transition-transform group-open:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
          <span class="flex-1">${escapeHtml(label)}</span>
          <span class="text-xs text-text-muted">${files.length}</span>
        </summary>
        <ul class="px-3 pb-2 space-y-1">
          ${files.map((f) => `
            <li class="flex items-center gap-2 px-2 py-1 rounded-md text-text-secondary text-xs hover:bg-surface-secondary" data-path="${escapeHtml(f.path)}">
              ${fileIcon(f)}
              <span class="truncate flex-1">${escapeHtml(f.path)}</span>
              <button class="trash-btn text-xs px-2 py-0.5 rounded ${f.targetFolder === 'Chak__Trash' ? 'bg-accent-warn/20 text-accent-warn' : 'bg-text-muted/10 text-text-muted hover:text-accent-danger'}" data-path="${escapeHtml(f.path)}">
                ${f.targetFolder === 'Chak__Trash' ? '복원' : '휴지통'}
              </button>
            </li>
          `).join('')}
        </ul>
      </details>
    `;
  }).join('') + (unclassified.length ? `
      <details class="group mt-4 bg-surface-card rounded-xl border border-surface-secondary overflow-hidden">
        <summary class="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-text-muted cursor-pointer hover:bg-surface-secondary select-none">
          <svg class="w-4 h-4 transition-transform group-open:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          <span class="flex-1">미분류</span>
          <span class="text-xs text-text-muted">${unclassified.length}</span>
        </summary>
        <ul class="px-3 pb-2 space-y-1">
          ${unclassified.map((f) => `
            <li class="flex items-center gap-2 px-2 py-1 text-xs text-text-muted">
              <span class="truncate flex-1">${escapeHtml(f.path)}</span>
              <button class="trash-btn text-xs px-2 py-0.5 rounded bg-text-muted/10 text-text-muted hover:text-accent-danger" data-path="${escapeHtml(f.path)}">
                휴지통
              </button>
            </li>
          `).join('')}
        </ul>
      </details>
  ` : '');
}

function attachTrashHandlers() {
  document.querySelectorAll('.trash-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const path = btn.dataset.path;
      if (!path) return;
      if (btn.textContent.trim() === '휴지통') {
        await dataLayer.markAsTrash(path);
      } else {
        await dataLayer.unmarkTrash(path);
      }
      await loadAndRender();
    });
  });
}

async function loadAndRender() {
  const scan = await dataLayer.getScan();
  renderBeforeTree(scan.files);
  renderAfterTree(scan);
  attachTrashHandlers();
  await renderStreak();
  const stats = scan.stats || {};
  const total = stats.totalCount || 0;
  const trash = scan.groups?.Chak__Trash?.length || 0;
  const subtitle = document.querySelector('.comparison-panel.after .comparison-panel-subtitle');
  if (subtitle) {
    subtitle.textContent = `휴지통 후보 ${trash} / 전체 ${total}`;
  }
}

async function renderStreak() {
  const { AppState } = await import('../main.js');
  const gamification = await AppState.getGamificationData();
  const el = document.getElementById('streak-count');
  if (el) el.textContent = gamification.streak || 0;
}

document.addEventListener('DOMContentLoaded', async () => {
  const rejectBtn = document.getElementById('rejectBtn');
  const acceptBtn = document.getElementById('acceptBtn');

  await loadAndRender();

  const unsub = dataLayer.subscribe(() => {
    loadAndRender();
  });

  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => {
      if (confirm('모든 휴지통 표시를 취소하시겠습니까?')) {
        const trashFiles = document.querySelectorAll('.trash-btn');
        Promise.all(Array.from(trashFiles).map((b) => {
          if (b.textContent.trim() === '복원') return dataLayer.unmarkTrash(b.dataset.path);
          return Promise.resolve();
        })).then(() => loadAndRender());
      }
    });
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', async () => {
      const scan = dataLayer._cache?.scan;
      if (!scan) return;
      const pending = scan.files.filter((f) => f.classified && f.targetPath && f.path !== f.targetPath);
      if (pending.length === 0) {
        alert('이동할 파일이 없습니다.\n파일 옆 "휴지통" 버튼으로 표시하거나, 분류된 모든 파일이 이미 이동되었습니다.');
        return;
      }
      const originalText = acceptBtn.textContent;
      acceptBtn.disabled = true;
      acceptBtn.textContent = '이동 중...';
      try {
        const result = await dataLayer.applyMoves({
          onProgress: ({ current, total }) => {
            acceptBtn.textContent = `이동 중... ${current}/${total}`;
          },
        });
        const summary = `이동 완료\n\n성공: ${result.moved}개\n건너뜀: ${result.skipped}개${result.errors.length ? '\n\n' + result.errors.slice(0, 5).map((e) => `• ${e.file.path}: ${e.reason}`).join('\n') : ''}`;
        alert(summary);
        await loadAndRender();
      } catch (e) {
        alert(`이동 실패: ${e.message || e}`);
      } finally {
        acceptBtn.disabled = false;
        acceptBtn.textContent = originalText;
      }
    });
  }

  window.addEventListener('beforeunload', () => unsub());
});
