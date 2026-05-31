import { MOTIVATIONAL_MESSAGES, DAILY_TIPS, AppState } from '../main.js';

document.addEventListener('DOMContentLoaded', async () => {
  let gamificationData = await AppState.getGamificationData();
  const achievements = gamificationData.achievements;

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

  function renderAchievements() {
    achievementsGrid.innerHTML = achievements.map(a => `
      <div class="achievement ${a.unlocked ? 'unlocked' : 'locked'}" data-id="${a.id}">
        <div class="achievement-icon">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.5"><use href="../assets/icons/icons.svg#icon-${a.icon}"></use></svg>
        </div>
        <div class="achievement-name">${a.name}</div>
        <div class="achievement-tier tier-${a.tier}">${a.tier}</div>
      </div>
    `).join('');
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

  function init() {
    if (!gamificationData) return;

    animateCount(streakCount, gamificationData.streak);
    streakIcon.innerHTML = `<svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5"><use href="../assets/icons/icons.svg#icon-${gamificationData.streak > 7 ? 'fire' : 'star'}"></use></svg>`;
    streakMessage.textContent = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];

    const completedDays = gamificationData.weeklyProgress.filter(d => d).length;
    const progressPercent = (completedDays / 7) * 100;
    progressFill.style.width = progressPercent + '%';
    daysCompleted.textContent = `${completedDays}/7`;

    renderWeekGrid(gamificationData.weeklyProgress);
    renderAchievements(gamificationData.achievements);

    habitToggle.checked = gamificationData.habitReminderEnabled;

    const randomTip = DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
    document.querySelector('.tip-text').textContent = randomTip.text;
    document.querySelector('.tip-author').textContent = `— ${randomTip.author}`;

    habitToggle.addEventListener('change', async (e) => {
      gamificationData.habitReminderEnabled = e.target.checked;
      await AppState.setGamificationData(gamificationData);
      showToast(e.target.checked ? 'Reminders enabled!' : 'Reminders disabled');
    });

    achievementsGrid.addEventListener('click', async (e) => {
      const achievement = e.target.closest('.achievement');
      if (achievement && !achievement.classList.contains('unlocked')) {
        const achId = achievement.dataset.id;
        const achData = gamificationData.achievements.find(a => a.id === achId);
        if (achData) {
          achData.unlocked = true;
          await AppState.setGamificationData(gamificationData);
          animateBadgeUnlock(achId);
          triggerConfetti();
          showToast(`${achData.name} unlocked!`);
          renderAchievements(gamificationData.achievements);
        }
      }
    });
  }

  init();
});