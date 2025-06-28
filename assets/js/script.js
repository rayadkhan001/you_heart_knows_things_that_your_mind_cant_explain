document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for fade-in on scroll
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

  // --- About Me section interactive toggles with fadeIn / fadeOut animations ---

  const buttons = document.querySelectorAll('.choice-btn');
  const contents = document.querySelectorAll('.choice-content');

  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent bubbling to document click

      const targetId = btn.getAttribute('data-target');

      contents.forEach((content) => {
        if (content.id === targetId) {
          if (!content.classList.contains('show')) {
            // Hide others with fadeOut
            contents.forEach((c) => {
              if (c !== content && c.classList.contains('show')) {
                fadeOutHide(c);
              }
            });
            // Show this one immediately
            fadeInShow(content);
          }
          // If clicked same button when already visible, do nothing or toggle off? Here: do nothing.
        } else {
          if (content.classList.contains('show')) {
            fadeOutHide(content);
          }
        }
      });
    });
  });

  // Clicking outside hides visible content with fadeOut
  document.addEventListener('click', () => {
    contents.forEach((content) => {
      if (content.classList.contains('show')) {
        fadeOutHide(content);
      }
    });
  });

  // Prevent clicks inside content from closing it
  contents.forEach((content) => {
    content.addEventListener('click', (e) => e.stopPropagation());
  });

  function fadeInShow(element) {
    element.classList.add('show');
    element.style.animation = 'fadeIn 0.5s ease forwards';
    element.style.opacity = 1;
  }

  function fadeOutHide(element) {
    element.style.animation = 'fadeOut 0.33s ease forwards';
    element.style.opacity = 0;

    function handleAnimationEnd() {
      element.classList.remove('show');
      element.style.animation = '';
      element.style.opacity = '';
      element.style.left = '';
      element.style.top = '';
      element.style.transform = 'translate(-50%, -50%)'; // Reset to center on hide
      element.removeEventListener('animationend', handleAnimationEnd);
    }

    element.addEventListener('animationend', handleAnimationEnd);
  }

  // === Draggable functionality for each .choice-content ===
  contents.forEach((content) => {
    let isDragging = false;
    let dragStartX, dragStartY;
    let elemStartLeft, elemStartTop;

    content.style.cursor = 'grab'; // show grab cursor

    content.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = true;
      content.style.cursor = 'grabbing';

      // Get initial mouse position
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      // Get current position of the element
      const rect = content.getBoundingClientRect();
      elemStartLeft = rect.left;
      elemStartTop = rect.top;

      // Disable transform to set absolute positioning directly
      content.style.transform = 'none';
      content.style.position = 'fixed';
      content.style.left = `${elemStartLeft}px`;
      content.style.top = `${elemStartTop}px`;

      // Attach mousemove and mouseup to document for dragging
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', onStopDrag);
    });

    function onDrag(e) {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;

      // Update position
      content.style.left = `${elemStartLeft + deltaX}px`;
      content.style.top = `${elemStartTop + deltaY}px`;
    }

    function onStopDrag() {
      if (!isDragging) return;
      isDragging = false;
      content.style.cursor = 'grab';
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', onStopDrag);
    }
  });

  // LocalStorage keys
  const storyStorageKey = 'sharedStories';
  const poemStorageKey = 'sharedPoem';
  const dreamStorageKey = 'sharedDreams';

  // Elements
  const storyForm = document.getElementById('storyForm');
  const storyInput = document.getElementById('storyInput');
  const storyList = document.getElementById('storyList');

  const poemForm = document.getElementById('poemForm');
  const poemInput = document.getElementById('poemInput');
  const poemList = document.getElementById('poemList');

  const dreamForm = document.getElementById('dreamForm');
  const dreamInput = document.getElementById('dreamInput');
  const dreamList = document.getElementById('dreamList');

  // Load or initialize
  let stories = JSON.parse(localStorage.getItem(storyStorageKey)) || [];
  let poemLines = JSON.parse(localStorage.getItem(poemStorageKey)) || [];
  let dreams = JSON.parse(localStorage.getItem(dreamStorageKey)) || [];

  // Escape HTML
  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }

  // Render functions
  function renderStories() {
    storyList.innerHTML = stories.map((s, i) => renderListItem(s, i, 'story')).join('');
  }
  function renderPoem() {
    poemList.innerHTML = poemLines.map((line, i) => renderListItem(line, i, 'poem')).join('');
  }
  function renderDreams() {
    dreamList.innerHTML = dreams.map((d, i) => renderListItem(d, i, 'dream')).join('');
  }

  // Render list item with edit button
  function renderListItem(text, index, type) {
    return `
        <li class="relative" data-index="${index}" data-type="${type}">
          <span class="list-text">${escapeHTML(text)}</span>
          <button class="btn btn-xs btn-outline absolute right-0 top-0 mt-0.5 mr-0.5 edit-btn">Edit</button>
        </li>
      `;
  }

  // Event handlers for editing
  function handleEditClick(e) {
    if (!e.target.classList.contains('edit-btn')) return;

    const li = e.target.closest('li');
    const index = parseInt(li.dataset.index, 10);
    const type = li.dataset.type;
    const currentText = li.querySelector('.list-text').textContent;

    // Replace span with input and show Save/Cancel buttons
    li.innerHTML = `
        <input type="text" class="edit-input" value="${escapeHTML(currentText)}" />
        <div class="edit-actions mt-1">
          <button class="btn btn-xs btn-outline save-btn mr-1">Save</button>
          <button class="btn btn-xs btn-outline cancel-btn">Cancel</button>
        </div>
      `;

    const input = li.querySelector('input.edit-input');
    input.focus();

    // Save & Cancel
    li.querySelector('.save-btn').addEventListener('click', () => saveEdit(li, index, type, input.value));
    li.querySelector('.cancel-btn').addEventListener('click', () => cancelEdit(li, index, type));
  }

  function saveEdit(li, index, type, newValue) {
    newValue = newValue.trim();
    if (!newValue) return alert('Empty text not allowed.');

    switch (type) {
      case 'story': stories[index] = newValue; localStorage.setItem(storyStorageKey, JSON.stringify(stories)); renderStories(); break;
      case 'poem': poemLines[index] = newValue; localStorage.setItem(poemStorageKey, JSON.stringify(poemLines)); renderPoem(); break;
      case 'dream': dreams[index] = newValue; localStorage.setItem(dreamStorageKey, JSON.stringify(dreams)); renderDreams(); break;
    }
  }

  function cancelEdit(li, index, type) {
    switch (type) {
      case 'story': renderStories(); break;
      case 'poem': renderPoem(); break;
      case 'dream': renderDreams(); break;
    }
  }

  // Submit story form
  storyForm.addEventListener('submit', e => {
    e.preventDefault();
    const value = storyInput.value.trim();
    if (!value) return alert('Please write a story.');
    stories.push(value);
    localStorage.setItem(storyStorageKey, JSON.stringify(stories));
    renderStories();
    storyInput.value = '';
  });

  // Submit poem form
  poemForm.addEventListener('submit', e => {
    e.preventDefault();
    const value = poemInput.value.trim();
    if (!value) return alert('Please add a poem line.');
    poemLines.push(value);
    localStorage.setItem(poemStorageKey, JSON.stringify(poemLines));
    renderPoem();
    poemInput.value = '';
  });

  // Submit dream form
  dreamForm.addEventListener('submit', e => {
    e.preventDefault();
    const value = dreamInput.value.trim();
    if (!value) return alert('Please enter a dream.');
    dreams.push(value);
    localStorage.setItem(dreamStorageKey, JSON.stringify(dreams));
    renderDreams();
    dreamInput.value = '';
  });

  // Delegate edit button click on lists
  [storyList, poemList, dreamList].forEach(list => {
    list.addEventListener('click', handleEditClick);
  });

  // Initial render
  renderStories();
  renderPoem();
  renderDreams();
});
