import { AppState } from '../main.js';
import { open } from '@tauri-apps/plugin-dialog';
import { downloadDir } from '@tauri-apps/api/path';
import { invoke } from '@tauri-apps/api/core';
import { dataLayer } from '../shared/dataLayer.js';

let selectedPath = null;
let currentStep = 1;
const totalSteps = 4;

async function init() {
  try {
    const result = await downloadDir();
    selectedPath = result;
  } catch (e) {
    selectedPath = null;
  }

  const nextBtn = document.getElementById('next-btn');
  const goDashboardBtn = document.getElementById('go-dashboard');
  const selectFolderBtn = document.getElementById('select-folder');
  const selectedPathEl = document.getElementById('selected-path');

  if (selectedPathEl) {
    selectedPathEl.textContent = selectedPath
      ? `기본 폴더: ${selectedPath}`
      : '선택된 폴더: 없음';
  }

  async function updateGoDashboardBtn() {
    if (currentStep !== totalSteps || selectedPath === null) {
      goDashboardBtn.classList.toggle('hidden', true);
      return;
    }
    try {
      const valid = await invoke('validate_scan_path', { path: selectedPath });
      goDashboardBtn.classList.toggle('hidden', !valid);
    } catch (e) {
      console.error('Path validation failed:', e);
      goDashboardBtn.classList.toggle('hidden', true);
    }
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
    updateGoDashboardBtn();
  }

  document.querySelectorAll('.step-dot').forEach(dot => {
    dot.addEventListener('click', () => updateStep(parseInt(dot.dataset.step)));
  });

  nextBtn.addEventListener('click', () => {
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
        updateGoDashboardBtn();
      }
    } catch (e) {
      console.error('Folder selection cancelled or failed:', e);
    }
  });

  goDashboardBtn?.addEventListener('click', async () => {
    goDashboardBtn.disabled = true;
    const originalText = goDashboardBtn.textContent;
    goDashboardBtn.textContent = '준비 중...';
    try {
      await dataLayer.setScanPath(selectedPath);
      await dataLayer.getScan({ force: true });
      await AppState.setOnboardingComplete(true);
      window.location.href = 'scene_dashboard.html';
    } catch (e) {
      alert(`스캔 실패: ${e.message || e}`);
      goDashboardBtn.disabled = false;
      goDashboardBtn.textContent = originalText;
    }
  });

  updateStep(1);
}

// Module scripts are deferred — DOM may already be ready

document.addEventListener('DOMContentLoaded', init);
