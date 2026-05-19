document.addEventListener('DOMContentLoaded', () => {
    const mockFiles = [
      { id: 1, name: 'project_proposal.pdf', type: 'pdf', size: '2.4 MB', date: '2024-01-15', icon: '📄' },
      { id: 2, name: 'meeting_notes.docx', type: 'doc', size: '156 KB', date: '2024-01-14', icon: '📝' },
      { id: 3, name: 'vacation_photo.jpg', type: 'image', size: '3.2 MB', date: '2024-01-13', icon: '🖼️' },
      { id: 4, name: 'budget_2024.xlsx', type: 'excel', size: '89 KB', date: '2024-01-12', icon: '📊' },
      { id: 5, name: 'presentation_final.pptx', type: 'ppt', size: '5.2 MB', date: '2024-01-11', icon: '📽️' },
      { id: 6, name: 'backup_2023.zip', type: 'archive', size: '156 MB', date: '2024-01-10', icon: '📦' },
      { id: 7, name: 'contract_signed.pdf', type: 'pdf', size: '1.1 MB', date: '2024-01-09', icon: '📋' },
    ];

    let files = [...mockFiles];
    let historyStack = [];
    let currentIndex = 0;

    const cardStack = document.getElementById('cardStack');
    const emptyState = document.getElementById('emptyState');
    const actionButtons = document.getElementById('actionButtons');
    const undoBtn = document.getElementById('undoBtn');
    const toast = document.getElementById('toast');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const currentFileName = document.getElementById('currentFileName');

    function getFileTypeInfo(type) {
      const types = {
        pdf: { label: 'PDF', color: '#ef4444' },
        doc: { label: 'Doc', color: '#3b82f6' },
        image: { label: 'Image', color: '#8b5cf6' },
        excel: { label: 'Excel', color: '#10b981' },
        ppt: { label: 'PPT', color: '#f97316' },
        archive: { label: 'Archive', color: '#6b7280' },
      };
      return types[type] || { label: 'File', color: '#6366f1' };
    }

    function createCard(file) {
      const typeInfo = getFileTypeInfo(file.type);
      return `
        <div class="file-card absolute inset-0 bg-surface-card rounded-3xl shadow-lg p-6 flex flex-col cursor-grab active:cursor-grabbing select-none" style="animation: cardEnter 0.4s ease forwards;">
          <div class="flex items-start justify-between mb-6">
            <div class="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center text-3xl">
              ${file.icon}
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-semibold" style="background-color: ${typeInfo.color}20; color: ${typeInfo.color}">${typeInfo.label}</span>
          </div>
          <div class="flex-1 flex flex-col justify-center">
            <h3 class="font-display text-xl font-semibold text-text-primary mb-2 text-center">${file.name}</h3>
            <div class="flex items-center justify-center gap-4 text-text-muted text-sm">
              <span>${file.size}</span>
              <span class="w-1 h-1 bg-text-muted rounded-full"></span>
              <span>${file.date}</span>
            </div>
          </div>
          <div id="overlayDelete" class="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-400/0 to-red-600/0 flex items-center justify-center opacity-0 transition-opacity duration-200 pointer-events-none">
            <div class="bg-white/90 backdrop-blur-sm rounded-2xl p-4">
              <svg class="w-16 h-16 text-red-500"><use href="#icon-trash"></use></svg>
            </div>
          </div>
          <div id="overlayKeep" class="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-400/0 to-emerald-600/0 flex items-center justify-center opacity-0 transition-opacity duration-200 pointer-events-none">
            <div class="bg-white/90 backdrop-blur-sm rounded-2xl p-4">
              <svg class="w-16 h-16 text-emerald-500"><use href="#icon-check"></use></svg>
            </div>
          </div>
        </div>
      `;
    }

    function renderCards() {
      if (files.length === 0) {
        cardStack.innerHTML = '';
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
        actionButtons.style.display = 'none';
        currentFileName.textContent = '모든 파일을 검토했습니다';
        return;
      }

      emptyState.classList.add('hidden');
      emptyState.classList.remove('flex');
      actionButtons.style.display = 'flex';

      const topFile = files[0];
      currentFileName.textContent = topFile.name;
      cardStack.innerHTML = createCard(topFile);

      const card = cardStack.querySelector('.file-card');
      initSwipe(card);
    }

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    function initSwipe(card) {
      if (!card) return;

      card.addEventListener('mousedown', (e) => startDrag(e));
      card.addEventListener('touchstart', (e) => startDrag(e), { passive: true });

      document.addEventListener('mousemove', (e) => moveDrag(e));
      document.addEventListener('touchmove', (e) => moveDrag(e), { passive: true });

      document.addEventListener('mouseup', () => endDrag(card));
      document.addEventListener('touchend', () => endDrag(card));
    }

    function startDrag(e) {
      isDragging = true;
      startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
      currentX = 0;
    }

    function moveDrag(e) {
      if (!isDragging) return;
      const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
      currentX = clientX - startX;

      const card = cardStack.querySelector('.file-card');
      if (!card) return;

      const rotation = currentX * 0.05;
      card.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`;

      const overlayDelete = card.querySelector('#overlayDelete');
      const overlayKeep = card.querySelector('#overlayKeep');

      if (currentX < -50) {
        overlayDelete.style.opacity = Math.min(Math.abs(currentX) / 100, 1);
        overlayDelete.classList.add('bg-gradient-to-br', 'from-red-400/95', 'to-red-600/95');
        overlayKeep.style.opacity = 0;
      } else if (currentX > 50) {
        overlayKeep.style.opacity = Math.min(currentX / 100, 1);
        overlayKeep.classList.add('bg-gradient-to-br', 'from-emerald-400/95', 'to-emerald-600/95');
        overlayDelete.style.opacity = 0;
      } else {
        overlayDelete.style.opacity = 0;
        overlayKeep.style.opacity = 0;
      }
    }

    function endDrag(card) {
      if (!isDragging) return;
      isDragging = false;

      if (currentX < -150) {
        animateCard(card, 'left');
      } else if (currentX > 150) {
        animateCard(card, 'right');
      } else {
        card.style.transform = 'translateX(0) rotate(0deg)';
        const overlayDelete = card.querySelector('#overlayDelete');
        const overlayKeep = card.querySelector('#overlayKeep');
        overlayDelete.style.opacity = 0;
        overlayKeep.style.opacity = 0;
      }
      currentX = 0;
    }

    function animateCard(card, direction) {
      if (direction === 'left') {
        card.classList.add('animate-card-exit-left');
        card.style.opacity = '0';
      } else {
        card.classList.add('animate-card-exit-right');
        card.style.opacity = '0';
      }

      setTimeout(() => {
        handleSwipe(direction === 'left' ? 'delete' : 'keep');
      }, 300);
    }

    function handleSwipe(action) {
      if (files.length === 0) return;

      const deletedFile = files.shift();
      historyStack.push(deletedFile);
      undoBtn.disabled = false;

      updateProgress();
      renderCards();
      showToast(action === 'delete' ? '파일 삭제됨' : '파일 보관됨');
    }

    function undo() {
      if (historyStack.length === 0) return;

      const restoredFile = historyStack.pop();
      files.unshift(restoredFile);

      undoBtn.disabled = historyStack.length === 0;

      updateProgress();
      renderCards();
      showToast('실행 취소됨');
    }

    function updateProgress() {
      const total = mockFiles.length;
      const current = files.length;
      const progress = Math.round(((total - current) / total) * 100);

      progressFill.style.width = `${progress}%`;
      progressText.textContent = `${progress}%`;
    }

    function showToast(message) {
      toast.textContent = message;
      toast.classList.add('opacity-100', 'translate-y-0');
      toast.classList.remove('opacity-0', '-translate-y-5');

      setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', '-translate-y-5');
      }, 2000);
    }

    function resetFiles() {
      files = [...mockFiles];
      historyStack = [];
      undoBtn.disabled = true;
      updateProgress();
      renderCards();
      showToast('초기화됨');
    }

    undoBtn.addEventListener('click', undo);

    renderCards();
    updateProgress();
});