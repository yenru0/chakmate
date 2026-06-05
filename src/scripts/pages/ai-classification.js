import { dataLayer } from '../shared/dataLayer.js';

const CATEGORY_LABELS = {
  image: '이미지',
  document: '문서',
  video: '비디오',
  audio: '오디오',
  archive: '압축파일',
  spreadsheet: '스프레드시트',
  presentation: '프레젠테이션',
  code: '코드',
  trash: '휴지통',
  other: '미분류',
};

const CATEGORY_COLORS = {
  image: '#8b5cf6',
  document: '#3b82f6',
  video: '#ec4899',
  audio: '#f59e0b',
  archive: '#6b7280',
  spreadsheet: '#10b981',
  presentation: '#f97316',
  code: '#06b6d4',
  trash: '#ef4444',
  other: '#94a3b8',
};

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function renderResults(scan) {
  const container = document.getElementById('classificationResults');
  if (!container) return;
  const byCategory = scan.stats?.byCategory || {};
  const total = scan.stats?.totalCount || 0;
  if (total === 0) {
    container.innerHTML = `<div class="text-center text-text-muted py-8 text-sm">분석할 파일이 없습니다. 폴더를 선택하고 스캔하세요.</div>`;
    return;
  }
  const sorted = Object.entries(byCategory)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);
  container.innerHTML = `
    <div class="mb-4 text-sm text-text-secondary">
      전체 <span class="font-bold text-text-primary">${total}</span>개 파일 분석 완료
    </div>
    <div class="space-y-2">
      ${sorted.map(([cat, count]) => {
        const pct = (count / total) * 100;
        const color = CATEGORY_COLORS[cat] || '#94a3b8';
        const label = CATEGORY_LABELS[cat] || cat;
        return `
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-sm flex-shrink-0" style="background: ${color}"></div>
            <div class="flex-1">
              <div class="flex items-center justify-between text-sm mb-1">
                <span class="font-medium text-text-primary">${escapeHtml(label)}</span>
                <span class="text-text-muted">${count}개 (${pct.toFixed(1)}%)</span>
              </div>
              <div class="h-2 bg-surface-secondary rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700" style="width: ${pct}%; background: ${color}"></div>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', async () => {
  let scan = await dataLayer.getScan();
  renderResults(scan);
  await renderStreak();

  const cancelBtn = document.getElementById('cancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      window.location.href = 'scene_dashboard.html';
    });
  }

  const unsub = dataLayer.subscribe(async () => {
    scan = await dataLayer.getScan();
    renderResults(scan);
    await renderStreak();
  });

  window.addEventListener('beforeunload', () => unsub());
});

async function renderStreak() {
  const { AppState } = await import('../main.js');
  const gamification = await AppState.getGamificationData();
  const el = document.getElementById('streak-count');
  if (el) el.textContent = gamification.streak || 0;
}
