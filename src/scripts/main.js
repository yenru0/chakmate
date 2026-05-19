document.addEventListener('DOMContentLoaded', () => {
  const state = {
    currentScreen: 'onboarding',
    onboardingStep: 1,
    streak: parseInt(localStorage.getItem('chackly_streak') || '7'),
    filesOrganized: parseInt(localStorage.getItem('chackly_files_organized') || '248'),
    foldersManaged: parseInt(localStorage.getItem('chackly_folders') || '12'),
    swipeIndex: 0,
    swipeHistory: [],
    theme: localStorage.getItem('chackly_theme') || 'light',
    settings: JSON.parse(localStorage.getItem('chackly_settings') || '{"notifications":true,"habits":false,"autoOrganize":false,"confirmDelete":true}')
  };

  const mockFiles = [
    { name: 'IMG_20240115_123456.jpg', type: 'image', size: '3.2 MB', date: '2024년 1월 15일', folder: '📷 사진' },
    { name: 'report_Q4_2023.pdf', type: 'pdf', size: '1.8 MB', date: '2024년 1월 10일', folder: '📄 문서' },
    { name: 'vacation_video.mp4', type: 'video', size: '156 MB', date: '2024년 1월 8일', folder: '🎬 영상' },
    { name: 'presentation.pptx', type: 'doc', size: '5.4 MB', date: '2024년 1월 5일', folder: '📄 문서' },
    { name: 'screenshot_2024.png', type: 'image', size: '890 KB', date: '2024년 1월 3일', folder: '📷 사진' },
    { name: 'meeting_notes.docx', type: 'doc', size: '245 KB', date: '2023년 12월 28일', folder: '📄 문서' },
    { name: 'family_photo.jpg', type: 'image', size: '4.1 MB', date: '2023년 12월 25일', folder: '📷 사진' },
    { name: 'project_files.zip', type: 'archive', size: '45 MB', date: '2023년 12월 20일', folder: '📦 압축' },
    { name: 'music_playlist.m3u', type: 'doc', size: '12 KB', date: '2023년 12월 15일', folder: '🎵 음악' },
    { name: 'budget_2024.xlsx', type: 'doc', size: '567 KB', date: '2023년 12월 10일', folder: '📊 스프레드시트' }
  ];

  const fileTree = [
    { name: '📁 문서', type: 'folder', children: [
      { name: '📄 report_Q4_2023.pdf', type: 'pdf', meta: '1.8 MB' },
      { name: '📄 presentation.pptx', type: 'ppt', meta: '5.4 MB' },
      { name: '📄 meeting_notes.docx', type: 'doc', meta: '245 KB' }
    ]},
    { name: '📁 사진', type: 'folder', children: [
      { name: '🖼️ IMG_20240115.jpg', type: 'image', meta: '3.2 MB' },
      { name: '🖼️ screenshot_2024.png', type: 'image', meta: '890 KB' },
      { name: '🖼️ family_photo.jpg', type: 'image', meta: '4.1 MB' }
    ]},
    { name: '📁 영상', type: 'folder', children: [
      { name: '🎬 vacation_video.mp4', type: 'video', meta: '156 MB' }
    ]},
    { name: '📁 압축', type: 'folder', children: [
      { name: '📦 project_files.zip', type: 'archive', meta: '45 MB' }
    ]}
  ];

  const suggestions = [
    { name: '📷 사진 → 2024', detail: '2개 파일 이동', selected: false },
    { name: '📄 문서 → quarterly', detail: '3개 파일 이동', selected: true },
    { name: '📦 압축 → 보관', detail: '1개 파일 이동', selected: false }
  ];

  const achievements = [
    { name: '첫 정리', icon: '🏆', color: 'gold', unlocked: true },
    { name: '7일 스트릭', icon: '🔥', color: 'gold', unlocked: true },
    { name: '파일 마스터', icon: '📁', color: 'silver', unlocked: true },
    { name: '정리의 달인', icon: '⭐', color: 'silver', unlocked: true },
    { name: '30일 스트릭', icon: '💎', color: 'gold', unlocked: false },
    { name: 'AI 활용자', icon: '🤖', color: 'bronze', unlocked: false },
    { name: '조직력왕', icon: '👑', color: 'silver', unlocked: false },
    { name: '창의命名', icon: '💡', color: 'bronze', unlocked: false }
  ];

  function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    state.currentScreen = screenId;

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.classList.add('text-text-muted');
    });
    const navBtn = document.getElementById('nav-' + screenId);
    if (navBtn) {
      navBtn.classList.add('active');
      navBtn.classList.remove('text-text-muted');
    }
  }

  function updateOnboardingStep(step) {
    document.querySelectorAll('.step-dot').forEach((dot, i) => {
      const isActive = i + 1 === step;
      dot.classList.toggle('active', isActive);
      dot.classList.toggle('bg-primary', isActive);
      dot.classList.toggle('bg-text-muted', !isActive);
      dot.style.width = isActive ? '32px' : '8px';
    });
    document.querySelectorAll('.onboarding-step').forEach(s => {
      const isActive = parseInt(s.dataset.step) === step;
      s.classList.toggle('active', isActive);
      s.classList.toggle('hidden', !isActive);
    });
    state.onboardingStep = step;
  }

  function renderFileTree() {
    const container = document.getElementById('file-tree');
    container.innerHTML = fileTree.map(item => `
      <div class="tree-item folder flex items-center gap-3 p-3 bg-accent/10 rounded-[12px] cursor-pointer hover:bg-overlay hover:translate-x-1 transition-all duration-150">
        <div class="tree-icon folder-icon w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 bg-primary/15 text-primary">
          <svg class="w-[18px] h-[18px] stroke-current fill-none stroke-2"><use href="#icon-folder"></use></svg>
        </div>
        <div class="tree-item-info flex-1 min-w-0">
          <div class="tree-item-name font-medium truncate">${item.name}</div>
          <div class="tree-item-meta text-xs text-text-muted">${item.children.length}개 항목</div>
        </div>
      </div>
      <div class="tree-children ml-8 flex flex-col gap-2">
        ${item.children.map(child => `
          <div class="tree-item flex items-center gap-3 p-3 bg-surface-secondary rounded-[12px] cursor-pointer hover:bg-overlay hover:translate-x-1 transition-all duration-150">
            <div class="tree-icon ${child.type === 'image' ? 'image-icon' : child.type === 'video' ? 'image-icon' : 'doc-icon'} w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 ${child.type === 'image' ? 'bg-pink-500/15 text-secondary' : child.type === 'video' ? 'bg-purple-500/15 text-purple-500' : 'bg-amber-500/15 text-accent-warn'}">
              <svg class="w-[18px] h-[18px] stroke-current fill-none stroke-2"><use href="#icon-document"></use></svg>
            </div>
            <div class="tree-item-info flex-1 min-w-0">
              <div class="tree-item-name font-medium truncate">${child.name}</div>
              <div class="tree-item-meta text-xs text-text-muted">${child.meta}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `).join('');
  }

  function renderSuggestions() {
    const container = document.getElementById('suggestion-list');
    container.innerHTML = suggestions.map((s, i) => `
      <div class="suggestion-item flex items-center gap-3 p-3 bg-surface-secondary rounded-[12px] cursor-pointer border-2 border-transparent transition-all duration-150 ${s.selected ? 'bg-primary/10 border-primary' : 'hover:bg-overlay hover:border-primary-light'}" data-index="${i}">
        <div class="suggestion-checkbox w-6 h-6 border-2 ${s.selected ? 'bg-primary border-primary' : 'border-text-muted'} rounded-[8px] flex items-center justify-center flex-shrink-0 transition-all duration-150">
          <svg class="w-3.5 h-3.5 stroke-white fill-none ${s.selected ? 'opacity-100' : 'opacity-0'} transition-opacity duration-150"><use href="#icon-check"></use></svg>
        </div>
        <div class="suggestion-content flex-1">
          <div class="suggestion-name font-medium mb-0.5">${s.name}</div>
          <div class="suggestion-detail text-sm text-text-secondary">${s.detail}</div>
        </div>
        <svg class="suggestion-arrow w-5 h-5 stroke-text-muted fill-none"><use href="#icon-chevron-right"></use></svg>
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
    container.innerHTML = achievements.map(a => `
      <div class="achievement aspect-square bg-surface-secondary rounded-[12px] flex flex-col items-center justify-center gap-1 p-2 transition-all duration-250 cursor-pointer hover:scale-105 ${a.unlocked ? '' : 'opacity-40 grayscale'}">
        <div class="achievement-icon w-9 h-9 rounded-[8px] flex items-center justify-center ${a.unlocked ? a.color === 'gold' ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : a.color === 'silver' ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' : 'bg-gradient-to-br from-amber-700 to-amber-900 text-white' : 'bg-overlay text-primary'}">
          <span class="text-lg">${a.icon}</span>
        </div>
        <div class="achievement-name text-[10px] text-center text-text-secondary">${a.name}</div>
        <div class="badge-tooltip absolute -top-8 left-1/2 -translate-x-1/2 bg-text-primary text-surface-card px-2 py-1 rounded-[8px] text-xs whitespace-nowrap opacity-0 invisible transition-all duration-150">${a.name}</div>
      </div>
    `).join('');
  }

  function updateSwipeCard() {
    if (state.swipeIndex >= mockFiles.length) return;
    const file = mockFiles[state.swipeIndex];
    const card = document.getElementById('current-card');
    card.style.opacity = '0';
    card.style.transform = 'scale(0.9) translateY(30px)';
    card.classList.add('animate-card-enter');

    requestAnimationFrame(() => {
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      card.style.opacity = '1';
      card.style.transform = 'scale(1) translateY(0)';
    });

    document.getElementById('card-name').textContent = file.name;
    document.getElementById('card-size').textContent = file.size;
    document.getElementById('card-folder').textContent = file.folder;
    document.getElementById('card-date').textContent = file.date;
    const cardPreview = document.getElementById('card-preview');
    cardPreview.innerHTML = `<use href="#icon-${file.type === 'image' ? 'photo' : file.type === 'video' ? 'photo' : file.type === 'pdf' ? 'document' : 'document'}"></use>`;
    document.getElementById('swipe-progress').textContent = `${state.swipeIndex + 1}/${mockFiles.length} 파일`;
  }

  document.getElementById('start-organizing').addEventListener('click', () => {
    showScreen('dashboard');
  });

  document.getElementById('nav-dashboard').addEventListener('click', () => showScreen('dashboard'));
  document.getElementById('nav-swipe').addEventListener('click', () => showScreen('swipe'));
  document.getElementById('nav-ai-suggestion').addEventListener('click', () => showScreen('ai-suggestion'));
  document.getElementById('nav-settings').addEventListener('click', () => showScreen('settings'));

  document.getElementById('apply-suggestions').addEventListener('click', () => showScreen('ai-suggestion'));

  document.getElementById('ai-cancel').addEventListener('click', () => showScreen('dashboard'));
  document.getElementById('ai-apply').addEventListener('click', () => {
    showScreen('dashboard');
    document.getElementById('success-modal').classList.add('active');
    document.querySelector('.modal').style.transform = 'scale(1)';
  });

  document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('success-modal').classList.remove('active');
  });

  document.querySelectorAll('.toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      toggle.style.background = toggle.classList.contains('active') ? '#3b82f6' : '';
      toggle.querySelector('::after') && (toggle.style.setProperty('--after-transform', toggle.classList.contains('active') ? 'translateX(24px)' : ''));
    });
  });

  document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
      option.classList.add('active');
      document.body.setAttribute('data-theme', option.dataset.theme);
      localStorage.setItem('chackly_theme', option.dataset.theme);
    });
  });

  let touchStartX = 0;
  const card = document.getElementById('current-card');

  card.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    card.classList.add('dragging');
  });

  card.addEventListener('touchmove', e => {
    const diff = e.touches[0].clientX - touchStartX;
    card.style.transform = `translateX(${diff}px) rotate(${diff * 0.05}deg)`;
    card.classList.toggle('swiping-left', diff < -50);
    card.classList.toggle('swiping-right', diff > 50);
  });

  card.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    card.classList.remove('dragging', 'swiping-left', 'swiping-right');
    if (Math.abs(diff) > 100) {
      state.swipeHistory.push({ file: mockFiles[state.swipeIndex], action: diff > 0 ? 'keep' : 'delete' });
      state.swipeIndex++;
      updateSwipeCard();
    } else {
      card.style.transform = '';
    }
  });

  document.getElementById('swipe-delete').addEventListener('click', () => {
    state.swipeHistory.push({ file: mockFiles[state.swipeIndex], action: 'delete' });
    state.swipeIndex++;
    updateSwipeCard();
  });

  document.getElementById('swipe-keep').addEventListener('click', () => {
    state.swipeHistory.push({ file: mockFiles[state.swipeIndex], action: 'keep' });
    state.swipeIndex++;
    updateSwipeCard();
  });

  document.getElementById('swipe-undo').addEventListener('click', () => {
    if (state.swipeHistory.length > 0) {
      state.swipeIndex--;
      state.swipeHistory.pop();
      updateSwipeCard();
    }
  });

  renderFileTree();
  renderSuggestions();
  renderAchievements();
  updateSwipeCard();
});