document.addEventListener('DOMContentLoaded', () => {
    const whyThisContent = document.getElementById('whyThisContent');

    // Intersection Observer for fade-in on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                whyThisContent.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3,
    });

    observer.observe(whyThisContent);

    // Heart click interaction: toggle color and scale on click
    const heart = document.getElementById('pulseHeart');
    heart.addEventListener('click', () => {
        heart.classList.toggle('active');
        // You could add more interactive effects here if desired
    });
});

document.addEventListener('DOMContentLoaded', () => {
  const content = document.querySelector('#whyThis .content-container');
  if (content) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          content.classList.add('visible');
          observer.unobserve(content);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(content);
  }

  const heart = document.getElementById('pulseHeart');
  if (heart) {
    heart.addEventListener('click', () => {
      heart.classList.toggle('active');
    });
  }
});

