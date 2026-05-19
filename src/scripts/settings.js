document.addEventListener('DOMContentLoaded', () => {
  const state = {
    theme: localStorage.getItem('chackly_theme') || 'light',
    settings: JSON.parse(localStorage.getItem('chackly_settings') || '{"notifications":true,"habits":false,"autoOrganize":false,"confirmDelete":true}')
  };

  function initToggles() {
    document.querySelectorAll('.toggle').forEach(toggle => {
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
      option.addEventListener('click', () => {
        document.querySelectorAll('.theme-option').forEach(o => {
          o.classList.remove('border-primary');
          o.classList.add('border-transparent');
        });
        option.classList.remove('border-transparent');
        option.classList.add('border-primary');
        state.theme = option.dataset.theme;
        localStorage.setItem('chackly_theme', state.theme);
        document.documentElement.setAttribute('data-theme', state.theme);
      });
    });

    const activeTheme = document.querySelector(`.theme-option[data-theme="${state.theme}"]`);
    if (activeTheme) {
      activeTheme.classList.remove('border-transparent');
      activeTheme.classList.add('border-primary');
    }
  }

  function saveSettings() {
    const settings = {
      notifications: document.getElementById('toggle-notifications')?.classList.contains('active'),
      habits: document.getElementById('toggle-habits')?.classList.contains('active'),
      autoOrganize: document.getElementById('toggle-autoOrganize')?.classList.contains('active'),
      confirmDelete: document.getElementById('toggle-confirmDelete')?.classList.contains('active')
    };
    localStorage.setItem('chackly_settings', JSON.stringify(settings));
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

  document.getElementById('reset-data')?.addEventListener('click', () => {
    if (confirm('모든 데이터를 초기화하시겠습니까?')) {
      localStorage.clear();
      location.reload();
    }
  });

  initToggles();
  initThemeOptions();
});