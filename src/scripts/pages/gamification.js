import { MOTIVATIONAL_MESSAGES, DAILY_TIPS, AppState } from '../main.js';
import { dataLayer } from '../shared/dataLayer.js';
import { renderAchievementCard } from '../shared/achievements.js';

document.addEventListener('DOMContentLoaded', async () => {
  let gamificationData = await AppState.getGamificationData();
  let lastUnlockedIds = new Set(gamificationData.achievements.filter((a) => a.unlocked).map((a) => a.id));

  const streakCount = document.getElementById('streakCount');
  const streakIcon = document.getElementById('streakIcon');
  const streakMessage = document.getElementById('streakMessage');
  const progressFill = document.getElementById('progressFill');
  const daysCompleted = document.getElementById('daysCompleted');
  const weekGrid = document.getElementById('weekGrid');
  const achievementsGrid = document.getElementById('achievementsGrid');
  const habitToggle = document.getElementById('habitToggle');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');
  const confettiContainer = document.getElementById('confettiContainer');

  function animateCount(element, target, duration = 1500) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * easeOut);
      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  function renderWeekGrid(progress) {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = new Date().getDay();
    const mondayIndex = today === 0 ? 6 : today - 1;

    weekGrid.innerHTML = days.map((day, i) => {
      const completed = progress[i];
      const isToday = i === mondayIndex;
      return `
        <div class="week-day">
          <div class="week-day-label">${day}</div>
          <div class="week-day-indicator ${completed ? 'completed' : ''} ${isToday ? 'today' : ''}">
            ${completed ? '<svg class="w-4 h-4 text-green-500"><use href="../assets/icons/icons.svg#icon-check"></use></svg>' : (isToday ? '<svg class="w-4 h-4 text-primary"><use href="../assets/icons/icons.svg#icon-clock"></use></svg>' : '')}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderAchievements(achievements) {
    achievementsGrid.innerHTML = achievements.map((a) => renderAchievementCard(a, { size: 'sm' })).join('');
  }

  function showToast(message) {
    toastText.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function triggerConfetti() {
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
      confettiContainer.appendChild(confetti);
    }
    setTimeout(() => confettiContainer.innerHTML = '', 3000);
  }

  function animateBadgeUnlock(achId) {
    const badge = achievementsGrid.querySelector(`[data-id="${achId}"]`);
    if (badge) {
      badge.classList.add('unlocked');
      badge.classList.add('animate');
      setTimeout(() => badge.classList.remove('animate'), 600);
    }
  }

  function render() {
    if (!gamificationData) return;

    animateCount(streakCount, gamificationData.streak);
    const headerStreak = document.getElementById('streak-count');
    if (headerStreak) headerStreak.textContent = gamificationData.streak || 0;
    streakIcon.innerHTML = `<svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5"><use href="../assets/icons/icons.svg#icon-${gamificationData.streak > 7 ? 'fire' : 'star'}"></use></svg>`;
    streakMessage.textContent = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];

    const completedDays = gamificationData.weeklyProgress.filter((d) => d).length;
    const progressPercent = (completedDays / 7) * 100;
    progressFill.style.width = progressPercent + '%';
    daysCompleted.textContent = `${completedDays}/7`;

    renderWeekGrid(gamificationData.weeklyProgress);
    renderAchievements(gamificationData.achievements);

    const currentUnlocked = gamificationData.achievements.filter((a) => a.unlocked);
    const newlyUnlocked = currentUnlocked.filter((a) => !lastUnlockedIds.has(a.id));
    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach((a) => {
        animateBadgeUnlock(a.id);
        showToast(`${a.name} 업적 달성!`);
      });
      triggerConfetti();
    }
    lastUnlockedIds = new Set(currentUnlocked.map((a) => a.id));
  }

  render();

  habitToggle.checked = gamificationData.habitReminderEnabled;
  habitToggle.addEventListener('change', async (e) => {
    gamificationData.habitReminderEnabled = e.target.checked;
    await AppState.setGamificationData(gamificationData);
    showToast(e.target.checked ? '리마인더 활성화!' : '리마인더 비활성화');
  });

  const randomTip = DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
  const tipText = document.querySelector('.tip-text');
  const tipAuthor = document.querySelector('.tip-author');
  if (tipText) tipText.textContent = randomTip.text;
  if (tipAuthor) tipAuthor.textContent = `— ${randomTip.author}`;

  const unsub = dataLayer.subscribe(async () => {
    gamificationData = await AppState.getGamificationData();
    render();
  });

  window.addEventListener('beforeunload', () => unsub());
});
