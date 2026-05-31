document.addEventListener('DOMContentLoaded', () => {
  // Stagger reveal discovery cards
  setTimeout(() => {
    document.querySelectorAll('.discovery-card').forEach(card => {
      card.classList.remove('opacity-0', 'translate-y-5');
      card.classList.add('opacity-100', 'translate-y-0');
    });
  }, 300);

  // Animate progress ring
  setTimeout(() => {
    document.querySelector('.progress-ring-fill').style.strokeDashoffset = '20';
  }, 500);

  // Animate confidence bars
  setTimeout(() => {
    document.querySelectorAll('.confidence-fill').forEach(bar => {
      const width = bar.style.width;
      bar.style.width = '0';
      setTimeout(() => {
        bar.style.width = width;
      }, 50);
    });
  }, 800);

  // Animate pie segments
  setTimeout(() => {
    document.querySelectorAll('.pie-segment').forEach(segment => {
      const dash = getComputedStyle(segment).getPropertyValue('--segment-dash');
      segment.style.strokeDasharray = dash + ' 314';
    });
  }, 600);

  // Animate pattern bars
  setTimeout(() => {
    document.querySelectorAll('.pattern-bar-fill').forEach(bar => {
      const width = bar.style.width;
      bar.style.width = '0';
      setTimeout(() => {
        bar.style.width = width;
      }, 50);
    });
  }, 700);

  // Tag pill interaction
  document.querySelectorAll('.tag-pill').forEach(tag => {
    tag.addEventListener('click', () => {
      tag.classList.add('tag-pill-feedback');
      setTimeout(() => {
        tag.classList.remove('tag-pill-feedback');
      }, 150);
    });
  });

  // Hint chip interaction
  document.querySelectorAll('.hint-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.add('hint-chip-feedback');
      setTimeout(() => {
        chip.classList.remove('hint-chip-feedback');
      }, 300);
    });
  });
});