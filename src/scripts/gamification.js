document.addEventListener('DOMContentLoaded', () => {
  let gamificationData = AppState.getGamificationData();

  // UI Elements
  const streakCount = document.getElementById('streakCount');
  const streakIcon = document.getElementById('streakIcon');
  const streakMessage = document.getElementById('streakMessage');
  const progressFill = document.getElementById('progressFill');
  const daysCompleted = document.getElementById('daysCompleted');
  const weekGrid = document.getElementById('weekGrid');
  const achievementsGrid = document.getElementById('achievementsGrid');
  const habitToggle = document.getElementById('habitToggle');
  const toast = document.getElementById('toast');
  const toastIcon = document.getElementById('toastIcon');
  const toastText = document.getElementById('toastText');
  const confettiContainer = document.getElementById('confettiContainer');

  const motivationalMessages = [
    "불을 이어가세요!",
    "오늘 불이 나고 있어요!",
    "놀라운 일관성!",
    "아무도 당신을 막을 수 없어요!",
    "챔피언의 행동!"
  ];

  const dailyTips = [
    { text: "작은 걸음이 큰 변화를 만듭니다! 오늘 5분만 투자하세요.", author: "일일 동기" },
    { text: "정돈된 공간은 정돈된 마음을 만듭니다. 작게 시작하세요!", author: "정리의 지혜" },
    { text: "정리된 모든 파일이 진보입니다.庆祝하세요!", author: "업적 달성" },
    { text: "미래의 당신이 오늘 정리한 것에 감사할 것입니다.", author: "타임 트래블러" },
    { text: "일관성이 완벽함을 이깁니다. 매일来吧!", author: "습관 마스터" }
  ];

  // Animate streak count
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

  // Render week grid
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
            ${completed ? '✅' : (isToday ? '◉' : '')}
          </div>
        </div>
      `;
    }).join('');
  }

  // Render achievements
  function renderAchievements(achievements) {
    achievementsGrid.innerHTML = achievements.map(ach => `
      <div class="achievement ${ach.unlocked ? `unlocked ${ach.tier}` : 'locked'}" data-id="${ach.id}">
        <span class="achievement-icon">${ach.icon}</span>
        <span class="achievement-name">${ach.name}</span>
        <div class="achievement-tooltip">${ach.requirement}</div>
      </div>
    `).join('');
  }

  // Show toast notification
  function showToast(icon, message) {
    toastIcon.textContent = icon;
    toastText.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // Confetti celebration
  function triggerConfetti() {
    const colors = ['#6366f1', '#f472b6', '#34d399', '#fbbf24', '#818cf8', '#34d399'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      confetti.style.width = Math.random() * 10 + 5 + 'px';
      confetti.style.height = confetti.style.width;
      confetti.style.animation = `confettiFall ${Math.random() * 2 + 2}s ease-out forwards`;
      confetti.style.animationDelay = Math.random() * 0.5 + 's';

      confettiContainer.appendChild(confetti);

      setTimeout(() => {
        confetti.remove();
      }, 4000);
    }
  }

  // Trigger badge unlock animation
  function animateBadgeUnlock(achievementId) {
    const badge = document.querySelector(`.achievement[data-id="${achievementId}"]`);
    if (badge) {
      badge.classList.add('just-unlocked');

      // Add sparkles
      for (let i = 0; i < 6; i++) {
        const sparkle = document.createElement('span');
        sparkle.className = 'sparkle';
        sparkle.textContent = '✨';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        badge.appendChild(sparkle);
      }

      setTimeout(() => {
        badge.classList.remove('just-unlocked');
        badge.querySelectorAll('.sparkle').forEach(s => s.remove());
      }, 600);
    }
  }

  // Initialize page
  function init() {
    gamificationData = AppState.getGamificationData();

    // Animate streak count
    animateCount(streakCount, gamificationData.streak);

    // Streak icon animation
    if (gamificationData.streak > 0) {
      streakIcon.classList.add('animate');
      setTimeout(() => streakIcon.classList.remove('animate'), 1000);
    }

    // Update streak message
    if (gamificationData.streak > 0) {
      streakMessage.textContent = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    }

    // Animate progress bar
    const completedDays = gamificationData.weeklyProgress.filter(Boolean).length;
    setTimeout(() => {
      progressFill.style.width = (completedDays / 7 * 100) + '%';
    }, 300);
    daysCompleted.textContent = completedDays;

    // Render week grid
    renderWeekGrid(gamificationData.weeklyProgress);

    // Render achievements
    renderAchievements(gamificationData.achievements);

    // Set habit toggle state
    habitToggle.checked = gamificationData.habitReminderEnabled;

    // Random daily tip
    const randomTip = dailyTips[Math.floor(Math.random() * dailyTips.length)];
    document.getElementById('tipText').textContent = `"${randomTip.text}"`;
    document.querySelector('.tip-author').textContent = `— ${randomTip.author}`;

    // Habit toggle handler
    habitToggle.addEventListener('change', (e) => {
      gamificationData.habitReminderEnabled = e.target.checked;
      AppState.setGamificationData(gamificationData);
      showToast(e.target.checked ? '🔔' : '🔕', e.target.checked ? 'Reminders enabled!' : 'Reminders disabled');
    });

    // Achievement click handler (for demo unlock)
    achievementsGrid.addEventListener('click', (e) => {
      const achievement = e.target.closest('.achievement');
      if (achievement && !achievement.classList.contains('unlocked')) {
        // Simulate unlock for demo
        const achId = achievement.dataset.id;
        const achData = gamificationData.achievements.find(a => a.id === achId);
        if (achData) {
          achData.unlocked = true;
          AppState.setGamificationData(gamificationData);
          animateBadgeUnlock(achId);
          triggerConfetti();
          showToast(achData.icon, `${achData.name} unlocked!`);
          renderAchievements(gamificationData.achievements);
        }
      }
    });
  }

  // Run on load
  init();
});