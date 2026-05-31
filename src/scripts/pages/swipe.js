import { getFileTypeInfo } from '../main.js';
import { scanDirectory } from '../shared/fileScanner.js';
import { AppState } from '../shared/state.js';
import { downloadDir } from '@tauri-apps/api/path';

const ICONS = {
  delete: 'trash',
  keep: 'folder',
  calendar: 'clock'
};

document.addEventListener('DOMContentLoaded', async () => {
    let files = [];
    let historyStack = [];
    let currentIndex = 0;

    const scanPath = await AppState.getScanPath() || await downloadDir();
    files = await scanDirectory(scanPath);

    const cardStack = document.getElementById('cardStack');
    const emptyState = document.getElementById('emptyState');
    const actionButtons = document.getElementById('actionButtons');
    const undoBtn = document.getElementById('undoBtn');
    const toast = document.getElementById('toast');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const currentFileName = document.getElementById('currentFileName');

    function createCard(file) {
      const typeInfo = getFileTypeInfo(file.type);

      return `
        <div class="file-card absolute w-full h-full bg-surface-card rounded-xl shadow-lg flex flex-col overflow-hidden touch-pan-y cursor-grab select-none" data-id="${file.id}">
          <div class="card-overlay absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 pointer-events-none rounded-xl z-10" id="overlayDelete">
            <span class="font-display text-2xl font-bold text-white uppercase tracking-wider">Delete</span>
          </div>
          <div class="card-overlay absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 pointer-events-none rounded-xl z-10" id="overlayKeep">
            <span class="font-display text-2xl font-bold text-white uppercase tracking-wider">Keep</span>
          </div>
          <div class="flex-1 flex flex-col items-center justify-center p-6">
            <div class="w-28 h-28 bg-surface-secondary rounded-2xl flex items-center justify-center mb-6">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" stroke-width="1.5" style="color: ${typeInfo.color}">
                <use href="../assets/icons/icons.svg#icon-${typeInfo.icon}"></use>
              </svg>
            </div>
            <h3 class="font-display text-lg font-semibold text-text-primary text-center mb-2 leading-tight break-all">${file.name}</h3>
            <p class="text-text-muted text-sm flex items-center gap-2">
              <svg class="w-4 h-4"><use href="../assets/icons/icons.svg#${ICONS.calendar}"></use></svg>
              ${file.date}
            </p>
          </div>
          <div class="card-footer px-6 py-4 bg-surface-secondary flex justify-center gap-8">
            <div class="flex items-center gap-2 text-text-muted text-xs">
              <svg class="w-4 h-4"><use href="../assets/icons/icons.svg#${ICONS.delete}"></use></svg>
              <span>${file.size}</span>
            </div>
            <div class="flex items-center gap-2 text-text-muted text-xs">
              <span>${typeInfo.label}</span>
            </div>
          </div>
        </div>
      `;
    }

    function renderStack() {
      if (!cardStack) return;
      cardStack.innerHTML = '';
      const visibleFiles = files.slice(currentIndex, currentIndex + 3);

      visibleFiles.reverse().forEach((file, i) => {
        const reversedIndex = visibleFiles.length - 1 - i;
        const card = document.createElement('div');
        card.innerHTML = createCard(file);
        const cardEl = card.firstElementChild;
        cardEl.style.zIndex = 10 + i;
        cardEl.style.transform = `scale(${1 - reversedIndex * 0.05}) translateY(${reversedIndex * 8}px)`;
        cardEl.style.opacity = reversedIndex === 0 ? 1 : 0.7;
        cardStack.appendChild(cardEl);
      });

      updateProgress();
      updateEmptyState();
    }

    function updateProgress() {
      if (!progressFill || !progressText) return;
      const total = files.length;
      const done = currentIndex;
      const percent = total > 0 ? (done / total) * 100 : 0;
      progressFill.style.width = `${percent}%`;
      progressText.textContent = `${done} / ${total}`;
    }

    function updateEmptyState() {
      if (!emptyState || !actionButtons) return;
      const isEmpty = currentIndex >= files.length;
      emptyState.classList.toggle('hidden', !isEmpty);
      actionButtons.classList.toggle('hidden', !isEmpty);
    }

    function showToast(message, icon) {
      if (!toast) return;
      toast.innerHTML = `<svg class="w-5 h-5"><use href="../assets/icons/icons.svg#${icon}"></use></svg><span>${message}</span>`;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }

    function swipe(direction) {
      if (currentIndex >= files.length) return;
      const card = cardStack.lastElementChild;
      if (!card) return;

      const file = files[currentIndex];
      historyStack.push({ ...file, action: direction });
      currentIndex++;

      card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      card.style.transform = direction === 'left'
        ? 'translateX(-150%) rotate(-30deg)'
        : 'translateX(150%) rotate(30deg)';
      card.style.opacity = '0';

      setTimeout(() => {
        renderStack();
        showToast(direction === 'left' ? 'Deleted' : 'Kept', direction === 'left' ? 'trash' : 'folder');
      }, 300);
    }

    function undo() {
      if (historyStack.length === 0) return;
      const last = historyStack.pop();
      currentIndex--;
      files.splice(currentIndex, 0, last);
      renderStack();
      showToast('Undo', 'arrow-left');
    }

    if (undoBtn) undoBtn.addEventListener('click', undo);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') swipe('left');
      if (e.key === 'ArrowRight') swipe('right');
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) undo();
    });

    let startX = 0;
    let currentX = 0;

    cardStack?.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });

    cardStack?.addEventListener('touchmove', (e) => {
      currentX = e.touches[0].clientX;
      const diff = currentX - startX;
      const card = cardStack.lastElementChild;
      if (card) {
        card.style.transform = `translateX(${diff}px) rotate(${diff * 0.1}deg)`;
        const overlay = diff < 0 ? '#overlayDelete' : '#overlayKeep';
        const otherOverlay = diff < 0 ? '#overlayKeep' : '#overlayDelete';
        card.querySelector(overlay).style.opacity = Math.min(Math.abs(diff) / 100, 1);
        card.querySelector(otherOverlay).style.opacity = 0;
      }
    });

    cardStack?.addEventListener('touchend', () => {
      const diff = currentX - startX;
      if (Math.abs(diff) > 100) {
        swipe(diff < 0 ? 'left' : 'right');
      } else {
        renderStack();
      }
      startX = 0;
      currentX = 0;
    });

    renderStack();
    updateEmptyState();
});