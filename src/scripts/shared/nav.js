import { mountTitlebar, initTitlebar } from './titlebar.js';

document.addEventListener('DOMContentLoaded', async () => {
  mountTitlebar();
  await initTitlebar();

  const currentPage = location.pathname.split('/').pop() || 'scene_dashboard.html';

  const navItems = [
    { href: 'scene_dashboard.html', label: '홈', svg: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
    { href: 'scene_swipe.html', label: '정리', svg: '<path d="M21 12H3M3 12L9 6M3 12L9 18M21 12L15 6M21 12L15 18"/>' },
    { href: 'scene_gamification.html', label: '업적', svg: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z"/>' },
    { href: 'scene_ai_classification.html', label: 'AI', svg: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>' },
    { href: 'scene_visualization.html', label: '시각화', svg: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/>' },
    { href: 'scene_settings.html', label: '설정', svg: '<path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>' },
  ];

  const navHTML = `
    <nav class="hidden md:flex fixed left-0 top-10 bottom-0 w-16 bg-surface-card border-r border-divider z-50 flex-col items-center py-4 gap-2">
      ${navItems.map(item => `
        <a href="${item.href}"
           class="flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl transition-all duration-200
                  ${currentPage === item.href
                    ? 'text-primary bg-primary/10'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-secondary'}">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            ${item.svg}
          </svg>
          <span class="text-[10px] font-medium">${item.label}</span>
        </a>
      `).join('')}
    </nav>

    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-surface-card border-t border-divider z-50">
      <div class="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        ${navItems.map(item => `
          <a href="${item.href}"
             class="flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200
                    ${currentPage === item.href
                      ? 'text-primary bg-primary/10'
                      : 'text-text-muted hover:text-text-primary'}">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              ${item.svg}
            </svg>
            <span class="text-[10px] font-medium">${item.label}</span>
          </a>
        `).join('')}
      </div>
    </nav>
  `;

  document.body.insertAdjacentHTML('beforeend', navHTML);
  document.body.classList.add('md:ml-16');
});