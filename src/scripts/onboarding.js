document.addEventListener('DOMContentLoaded', () => {
  const state = {
    onboardingStep: 1
  };

  function updateOnboardingStep(step) {
    document.querySelectorAll('.step-dot').forEach((dot, i) => {
      const isActive = i + 1 === step;
      dot.classList.toggle('active', isActive);
      dot.classList.toggle('bg-primary', isActive);
      dot.classList.toggle('bg-text-muted', !isActive);
      dot.style.width = isActive ? '32px' : '8px';
    });
    document.querySelectorAll('.onboarding-step').forEach(s => {
      const isActive = parseInt(s.dataset.step) === step;
      s.classList.toggle('active', isActive);
      s.classList.toggle('hidden', !isActive);
    });
    state.onboardingStep = step;
  }

  document.querySelectorAll('.step-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const step = parseInt(dot.dataset.step);
      updateOnboardingStep(step);
    });
  });

  const startBtn = document.getElementById('start-organizing');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      window.location.href = 'scene_dashboard.html';
    });
  }

  updateOnboardingStep(1);
});