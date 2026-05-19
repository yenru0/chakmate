document.addEventListener('DOMContentLoaded', () => {
  // Data Management
  const STORAGE_KEY = 'chackly_gamification';

  const defaultData = {
    streak: 12,
    weeklyProgress: [true, true, true, true, false, false, false],
    achievements: [
      { id: 'first_sort', name: '첫 정리', icon: '🏆', unlocked: true, tier: 'gold', requirement: '첫 정리 세션 완료' },
      { id: 'week_warrior', name: '주간 챌린저', icon: '🌟', unlocked: true, tier: 'gold', requirement: '7일 연속 완료' },
      { id: 'streak_7', name: '7일 스트릭', icon: '🔥', unlocked: true, tier: 'silver', requirement: '7일 스트릭 유지' },
      { id: 'diamond', name: '다이아몬드', icon: '💎', unlocked: true, tier: 'gold', requirement: '30일 스트릭 유지' },
      { id: 'organizer', name: '정리 달인', icon: '📦', unlocked: false, tier: 'silver', requirement: '100개 파일 정리' },
      { id: 'minimalist', name: '미니멀리스트', icon: '✨', unlocked: false, tier: 'bronze', requirement: '50개 파일 삭제' },
      { id: 'speed_demon', name: '스피드 데몬', icon: '⚡', unlocked: false, tier: 'gold', requirement: '하루에 50개 파일 정리' },
      { id: 'collector', name: '수집가', icon: '🗂️', unlocked: false, tier: 'silver', requirement: '5개 커스텀 폴더 생성' }
    ],
    habitReminderEnabled: true,
    lastUpdated: new Date().toISOString()
  };

  function loadData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultData, ...JSON.parse(stored) };
    }
    return defaultData;
  }

  function saveData(data) {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

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
    const data = loadData();

    // Animate streak count
    animateCount(streakCount, data.streak);

    // Streak icon animation
    if (data.streak > 0) {
      streakIcon.classList.add('animate');
      setTimeout(() => streakIcon.classList.remove('animate'), 1000);
    }

    // Update streak message
    if (data.streak > 0) {
      streakMessage.textContent = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    }

    // Animate progress bar
    const completedDays = data.weeklyProgress.filter(Boolean).length;
    setTimeout(() => {
      progressFill.style.width = (completedDays / 7 * 100) + '%';
    }, 300);
    daysCompleted.textContent = completedDays;

    // Render week grid
    renderWeekGrid(data.weeklyProgress);

    // Render achievements
    renderAchievements(data.achievements);

    // Set habit toggle state
    habitToggle.checked = data.habitReminderEnabled;

    // Random daily tip
    const randomTip = dailyTips[Math.floor(Math.random() * dailyTips.length)];
    document.getElementById('tipText').textContent = `"${randomTip.text}"`;
    document.querySelector('.tip-author').textContent = `— ${randomTip.author}`;

    // Habit toggle handler
    habitToggle.addEventListener('change', (e) => {
      data.habitReminderEnabled = e.target.checked;
      saveData(data);
      showToast(e.target.checked ? '🔔' : '🔕', e.target.checked ? 'Reminders enabled!' : 'Reminders disabled');
    });

    // Achievement click handler (for demo unlock)
    achievementsGrid.addEventListener('click', (e) => {
      const achievement = e.target.closest('.achievement');
      if (achievement && !achievement.classList.contains('unlocked')) {
        // Simulate unlock for demo
        const achId = achievement.dataset.id;
        const achData = data.achievements.find(a => a.id === achId);
        if (achData) {
          achData.unlocked = true;
          saveData(data);
          animateBadgeUnlock(achId);
          triggerConfetti();
          showToast(achData.icon, `${achData.name} unlocked!`);
          renderAchievements(data.achievements);
        }
      }
    });
  }

  // Run on load
  init();
});