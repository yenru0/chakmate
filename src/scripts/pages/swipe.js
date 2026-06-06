import { getFileTypeInfo } from '../main.js';
import { dataLayer } from '../shared/dataLayer.js';
import { info, warn, error, debug } from '../shared/logger.js';

const ICONS = {
  delete: 'trash',
  keep: 'folder',
  calendar: 'clock',
  alert: 'alert',
};

function needsReview(f) {
  if (f.targetFolder === 'Chak__Trash' && f.path !== f.targetPath) return true;
  if (!f.classified) return true;
  return false;
}

document.addEventListener('DOMContentLoaded', async () => {
  let files = [];
  let historyStack = [];
  let currentIndex = 0;

  const scan = await dataLayer.getScan();
  files = scan.files.filter(needsReview);
  info(`[swipe] initial queue: ${files.length} files (unclassified + pending trash)`);

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
    const isUnclassified = !file.classified;

    return `
        <div class="file-card absolute w-full h-full bg-surface-card rounded-xl shadow-lg flex flex-col overflow-hidden touch-pan-y cursor-grab select-none" data-path="${file.path}">
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
            ${isUnclassified ? `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-accent-warn/20 text-accent-warn mb-2">
                <svg class="w-3 h-3"><use href="../assets/icons/icons.svg#icon-${ICONS.alert}"></use></svg>
                미분류
              </span>
            ` : ''}
            <p class="text-text-muted text-sm flex items-center gap-2">
              <svg class="w-4 h-4"><use href="../assets/icons/icons.svg#${ICONS.calendar}"></use></svg>
              ${file.date}
            </p>
          </div>
          <div class="card-footer px-6 py-4 bg-surface-secondary flex justify-center gap-8">
            <div class="flex items-center gap-2 text-text-muted text-xs">
              <svg class="w-4 h-4"><use href="../assets/icons/icons.svg#icon-${ICONS.delete}"></use></svg>
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
    updateCurrentFileName();
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
    if (!emptyState) return;
    const isEmpty = currentIndex >= files.length;
    emptyState.classList.toggle('hidden', !isEmpty);
  }

  function updateCurrentFileName() {
    if (!currentFileName) return;
    const current = files[currentIndex];
    if (current) {
      currentFileName.textContent = current.name;
    } else {
      currentFileName.textContent = '검토 완료';
    }
  }

  function showToast(message, icon) {
    if (!toast) return;
    toast.innerHTML = `<svg class="w-5 h-5"><use href="../assets/icons/icons.svg#${icon}"></use></svg><span>${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  async function swipe(direction) {
    if (currentIndex >= files.length) return;
    const card = cardStack.lastElementChild;
    if (!card) return;

    const file = files[currentIndex];
    const targetPath = file.path;
    const isPendingTrash = file.targetFolder === 'Chak__Trash' && file.path !== file.targetPath;

    let success = false;
    let actionLabel = '';
    if (direction === 'left') {
      if (isPendingTrash) {
        const result = await dataLayer.applyMoves({ filter: (f) => f.path === targetPath });
        if (result.moved > 0) {
          success = true;
          actionLabel = '휴지통으로 이동';
          file.path = file.targetPath;
        } else {
          actionLabel = result.errors[0]?.reason || '이동 실패';
        }
      } else {
        const ok = await dataLayer.markAsTrash(file.path);
        if (ok) {
          success = true;
          actionLabel = '휴지통으로 표시';
          file.targetFolder = 'Chak__Trash';
          file.targetPath = `Chak__Trash/${file.path}`;
        } else {
          actionLabel = '표시 실패';
        }
      }
    } else {
      if (file.targetFolder === 'Chak__Trash') {
        const ok = await dataLayer.unmarkTrash(file.path);
        if (ok) {
          success = true;
          actionLabel = '복원';
          file.targetFolder = null;
          file.targetPath = null;
        } else {
          actionLabel = '복원 실패';
        }
      } else {
        success = true;
        actionLabel = '건너뜀';
      }
    }

    if (success) {
      historyStack.push({ ...file, action: direction, success });
      files.splice(currentIndex, 1);
      if (undoBtn) undoBtn.disabled = false;
    } else {
      showToast(actionLabel, 'x');
      return;
    }

    if (card) {
      card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      card.style.transform = direction === 'left'
        ? 'translateX(-150%) rotate(-30deg)'
        : 'translateX(150%) rotate(30deg)';
      card.style.opacity = '0';
    }

    setTimeout(() => {
      renderStack();
      showToast(actionLabel, direction === 'left' ? 'trash' : 'folder');
    }, 300);
  }

  function undo() {
    if (historyStack.length === 0) return;
    const last = historyStack.pop();
    currentIndex--;
    files.splice(currentIndex, 0, last);
    if (undoBtn) undoBtn.disabled = historyStack.length === 0;
    renderStack();
    showToast('Undo', 'arrow-left');
  }

  if (undoBtn) undoBtn.addEventListener('click', undo);

  async function restartQueue() {
    const scan = await dataLayer.getScan({ force: true });
    files = scan.files.filter(needsReview);
    currentIndex = 0;
    historyStack = [];
    if (undoBtn) undoBtn.disabled = true;
    renderStack();
    updateEmptyState();
    info(`[swipe] queue restarted: ${files.length} files`);
  }

  function initActionButtons() {
    document.getElementById('deleteBtn')?.addEventListener('click', () => swipe('left'));
    document.getElementById('keepBtn')?.addEventListener('click', () => swipe('right'));
    document.getElementById('restartBtn')?.addEventListener('click', restartQueue);
    document.getElementById('saveBtn')?.addEventListener('click', saveProgress);
  }

  function saveProgress() {
    showToast('여기까지만 저장됨', 'check');
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') swipe('left');
    if (e.key === 'ArrowRight') swipe('right');
    if (e.key === 'z' && (e.ctrlKey || e.metaKey)) undo();
  });

  let startX = 0;
  let currentX = 0;

  function applyDrag(diff) {
    const card = cardStack.lastElementChild;
    if (!card) return;
    card.style.transform = `translateX(${diff}px) rotate(${diff * 0.1}deg)`;
    const overlay = diff < 0 ? '#overlayDelete' : '#overlayKeep';
    const otherOverlay = diff < 0 ? '#overlayKeep' : '#overlayDelete';
    card.querySelector(overlay).style.opacity = Math.min(Math.abs(diff) / 100, 1);
    card.querySelector(otherOverlay).style.opacity = 0;
  }

  function endDrag() {
    const diff = currentX - startX;
    if (Math.abs(diff) > 100) {
      swipe(diff < 0 ? 'left' : 'right');
    } else {
      renderStack();
    }
    startX = 0;
    currentX = 0;
  }

  function pointerX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  cardStack?.addEventListener('touchstart', (e) => { startX = pointerX(e); });
  cardStack?.addEventListener('touchmove', (e) => { currentX = pointerX(e); applyDrag(currentX - startX); });
  cardStack?.addEventListener('touchend', endDrag);

  cardStack?.addEventListener('mousedown', (e) => { startX = pointerX(e); });
  document.addEventListener('mousemove', (e) => {
    if (startX === 0) return;
    currentX = pointerX(e);
    applyDrag(currentX - startX);
  });
  document.addEventListener('mouseup', () => {
    if (startX === 0) return;
    endDrag();
  });

  initActionButtons();
  renderStack();
  updateEmptyState();
});
