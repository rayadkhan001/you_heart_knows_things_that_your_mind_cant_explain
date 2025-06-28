document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('.content-container');
  const heart = document.getElementById('pulseHeart');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  containers.forEach(container => observer.observe(container));

  if (heart) {
    heart.addEventListener('click', () => {
      heart.classList.toggle('active');
    });
  }
});
