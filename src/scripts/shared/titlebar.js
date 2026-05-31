export async function initTitlebar() {
  const { getCurrentWindow } = await import('@tauri-apps/api/window');

  const appWindow = getCurrentWindow();
  const titlebar = document.getElementById('custom-titlebar');
  const minimizeBtn = document.getElementById('titlebar-minimize');
  const maximizeBtn = document.getElementById('titlebar-maximize');
  const closeBtn = document.getElementById('titlebar-close');
  const maximizeIcon = document.getElementById('maximize-icon');
  const restoreIcon = document.getElementById('restore-icon');

  async function updateIcon() {
    const isMaximized = await appWindow.isMaximized();
    maximizeIcon.style.display = isMaximized ? 'none' : 'block';
    restoreIcon.style.display = isMaximized ? 'block' : 'none';
  }

  minimizeBtn.addEventListener('click', () => appWindow.minimize());

  maximizeBtn.addEventListener('click', async () => {
    await appWindow.toggleMaximize();
    updateIcon();
  });

  closeBtn.addEventListener('click', () => appWindow.close());

  titlebar.addEventListener('dblclick', async (e) => {
    if (e.target.closest('.titlebar-controls')) return;
    await appWindow.toggleMaximize();
    updateIcon();
  });

  updateIcon();
  appWindow.onResized(() => updateIcon());
}

export function mountTitlebar() {
  const titlebarHTML = `
    <div id="custom-titlebar" class="custom-titlebar" data-tauri-drag-region>
      <div class="titlebar-left" data-tauri-drag-region>
        <img src="../assets/logo.svg" alt="Chakmate" class="titlebar-logo" data-tauri-drag-region>
        <span class="titlebar-title" data-tauri-drag-region>Chakmate</span>
      </div>
      <div class="titlebar-center" data-tauri-drag-region></div>
      <div class="titlebar-controls">
        <button id="titlebar-minimize" class="titlebar-btn" aria-label="최소화">
          <svg width="12" height="12" viewBox="0 0 12 12"><rect y="5" width="12" height="2" fill="currentColor"/></svg>
        </button>
        <button id="titlebar-maximize" class="titlebar-btn" aria-label="최대화">
          <svg id="maximize-icon" width="12" height="12" viewBox="0 0 12 12"><rect x="1" y="1" width="10" height="10" stroke="currentColor" stroke-width="2" fill="none"/></svg>
          <svg id="restore-icon" width="12" height="12" viewBox="0 0 12 12" style="display:none"><path d="M3 1h8v8h-2v2H1V3h2V1zm1 3v5h5V4H4z" fill="currentColor"/></svg>
        </button>
        <button id="titlebar-close" class="titlebar-btn titlebar-btn-close" aria-label="닫기">
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="2"/></svg>
        </button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('afterbegin', titlebarHTML);
}