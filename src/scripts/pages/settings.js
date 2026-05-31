import { AppState } from '../main.js';

document.addEventListener('DOMContentLoaded', async () => {
  const state = {
    theme: await AppState.getTheme(),
    settings: await AppState.getSettings()
  };

  function initToggles() {
    document.querySelectorAll('.toggle').forEach(toggle => {
      const key = toggle.id.replace('toggle-', '');
      if (state.settings[key]) {
        toggle.classList.add('active');
        toggle.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
      }

      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        const isActive = toggle.classList.contains('active');
        toggle.style.background = isActive ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '';
        saveSettings();
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

  document.getElementById('reset-data')?.addEventListener('click', async () => {
    if (confirm('Reset all data?')) {
      localStorage.clear();
      location.reload();
    }
  });

  initToggles();
  initThemeOptions();
});