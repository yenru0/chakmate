import { AppState } from '../main.js';
import { open } from '@tauri-apps/plugin-dialog';
import { downloadDir } from '@tauri-apps/api/path';

let selectedPath = null;
let currentStep = 1;
const totalSteps = 4;

document.addEventListener('DOMContentLoaded', async () => {
  alert('1: start');
  const defaultPath = 'C:\\Users\\Public\\Downloads';
  alert('2: defaultPath = ' + defaultPath);
  selectedPath = defaultPath;

  const nextBtn = document.getElementById('next-btn');
  alert('3: nextBtn = ' + (nextBtn ? 'found' : 'null'));
  const selectFolderBtn = document.getElementById('select-folder');
  const selectedPathEl = document.getElementById('selected-path');

  if (selectedPathEl) {
    selectedPathEl.textContent = `기본 폴더: ${defaultPath}`;
  }

  function updateStep(s) {
    currentStep = s;
    document.querySelectorAll('.step-dot').forEach((dot, i) => {
      const isActive = i + 1 === s;
      dot.classList.toggle('active', isActive);
      dot.classList.toggle('bg-primary', isActive);
      dot.classList.toggle('bg-text-muted', !isActive);
      dot.style.width = isActive ? '32px' : '8px';
    });
    document.querySelectorAll('.onboarding-step').forEach(el => {
      const isActive = parseInt(el.dataset.step) === s;
      el.classList.toggle('active', isActive);
      el.classList.toggle('hidden', !isActive);
    });

    nextBtn.classList.toggle('hidden', s === totalSteps);
    goDashboardBtn.classList.toggle('hidden', s !== totalSteps);
  }

  document.querySelectorAll('.step-dot').forEach(dot => {
    dot.addEventListener('click', () => updateStep(parseInt(dot.dataset.step)));
  });

  nextBtn.addEventListener('click', () => {
    alert('onclick works!');
    if (currentStep < totalSteps) {
      updateStep(currentStep + 1);
    }
  });

  selectFolderBtn.addEventListener('click', async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: '정리할 폴더 선택'
      });
      if (selected) {
        selectedPath = selected;
        if (selectedPathEl) {
          selectedPathEl.textContent = `선택된 폴더: ${selected}`;
        }
        selectFolderBtn.querySelector('span').textContent = '폴더 변경';
      }
    } catch (e) {
      console.error('Folder selection cancelled or failed:', e);
    }
  });

  goDashboardBtn?.addEventListener('click', async () => {
    await AppState.setScanPath(selectedPath);
    await AppState.setOnboardingComplete(true);
    window.location.href = 'scene_dashboard.html';
  });

  updateStep(1);
});