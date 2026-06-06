import { AppState } from '../main.js';
import { dataLayer } from '../shared/dataLayer.js';
import { pickScanFolder } from '../shared/folderPicker.js';

document.addEventListener('DOMContentLoaded', async () => {
  const state = {
    theme: await AppState.getTheme(),
    settings: await AppState.getSettings()
  };

  async function initScanPath() {
    const display = document.getElementById('scanPathDisplay');
    if (!display) return;
    try {
      const scanPath = await dataLayer.getScanPath();
      if (scanPath) {
        display.textContent = scanPath;
        display.title = scanPath;
      }
    } catch (e) {
      console.error('Failed to load scan path:', e);
    }
  }

  function initToggles() {
    document.querySelectorAll('.toggle').forEach(toggle => {
      const key = toggle.id.replace('toggle-', '');
      if (state.settings[key]) {
        toggle.classList.add('active');
        toggle.setAttribute('aria-checked', 'true');
      }

      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        const isActive = toggle.classList.contains('active');
        toggle.setAttribute('aria-checked', String(isActive));
        saveSettings();
      });

      toggle.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggle.click();
        }
      });
    });
  }

  function initThemeOptions() {
    document.querySelectorAll('.theme-option').forEach(option => {
      option.addEventListener('click', async () => {
        document.querySelectorAll('.theme-option').forEach(o => {
          o.classList.remove('border-primary');
          o.classList.add('border-transparent');
        });
        option.classList.remove('border-transparent');
        option.classList.add('border-primary');
        await AppState.setTheme(option.dataset.theme);
        state.theme = option.dataset.theme;
      });
    });

    const activeTheme = document.querySelector(`.theme-option[data-theme="${state.theme}"]`);
    if (activeTheme) {
      activeTheme.classList.remove('border-transparent');
      activeTheme.classList.add('border-primary');
    }
  }

  async function saveSettings() {
    const settings = {
      notifications: document.getElementById('toggle-notifications')?.classList.contains('active'),
      habits: document.getElementById('toggle-habits')?.classList.contains('active'),
      autoOrganize: document.getElementById('toggle-autoOrganize')?.classList.contains('active'),
      confirmDelete: document.getElementById('toggle-confirmDelete')?.classList.contains('active')
    };
    await AppState.setSettings(settings);
  }

  document.getElementById('export-data')?.addEventListener('click', () => {
    const data = {
      theme: state.theme,
      settings: state.settings,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chakmate-export.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('changePathBtn')?.addEventListener('click', async () => {
    try {
      const selected = await pickScanFolder();
      if (!selected) return;
      await dataLayer.setScanPath(selected);
      const display = document.getElementById('scanPathDisplay');
      if (display) {
        display.textContent = selected;
        display.title = selected;
      }
    } catch (e) {
      console.error('Folder change failed:', e);
    }
  });

  document.getElementById('reset-data')?.addEventListener('click', async () => {
    if (confirm('Reset all data?')) {
      await AppState.resetAll();
      const { dataLayer } = await import('../shared/dataLayer.js');
      dataLayer.invalidate();
      location.reload();
    }
  });

  initToggles();
  initThemeOptions();
  initScanPath();
});