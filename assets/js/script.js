document.addEventListener('DOMContentLoaded', () => {
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
      <div class="edit-actions">
        <button class="btn btn-xs btn-success save-btn">Save</button>
        <button class="btn btn-xs btn-error cancel-btn">Cancel</button>
      </div>
    `;

  const input = li.querySelector('.edit-input');
  const saveBtn = li.querySelector('.save-btn');
  const cancelBtn = li.querySelector('.cancel-btn');

  input.focus();

  saveBtn.addEventListener('click', () => {
    const newValue = input.value.trim();
    if (newValue) {
      if (type === 'story') {
        stories[index] = newValue;
        localStorage.setItem(storyStorageKey, JSON.stringify(stories));
        renderStories();
      } else if (type === 'poem') {
        poemLines[index] = newValue;
        localStorage.setItem(poemStorageKey, JSON.stringify(poemLines));
        renderPoem();
      } else if (type === 'dream') {
        dreams[index] = newValue;
        localStorage.setItem(dreamStorageKey, JSON.stringify(dreams));
        renderDreams();
      }
    }
  });

  cancelBtn.addEventListener('click', () => {
    // Re-render without changes
    if (type === 'story') renderStories();
    else if (type === 'poem') renderPoem();
    else if (type === 'dream') renderDreams();
  });
}

// Add submit handlers
storyForm.addEventListener('submit', e => {
  e.preventDefault();
  const val = storyInput.value.trim();
  if (val) {
    stories.push(val);
    localStorage.setItem(storyStorageKey, JSON.stringify(stories));
    renderStories();
    storyInput.value = '';
  }
});

poemForm.addEventListener('submit', e => {
  e.preventDefault();
  const val = poemInput.value.trim();
  if (val) {
    poemLines.push(val);
    localStorage.setItem(poemStorageKey, JSON.stringify(poemLines));
    renderPoem();
    poemInput.value = '';
  }
});

dreamForm.addEventListener('submit', e => {
  e.preventDefault();
  const val = dreamInput.value.trim();
  if (val) {
    dreams.push(val);
    localStorage.setItem(dreamStorageKey, JSON.stringify(dreams));
    renderDreams();
    dreamInput.value = '';
  }
});

// Delegate edit button clicks for all lists
storyList.addEventListener('click', handleEditClick);
poemList.addEventListener('click', handleEditClick);
dreamList.addEventListener('click', handleEditClick);

// Initial render
renderStories();
renderPoem();
renderDreams();

// custome script
document.getElementById('submitAndRedirect').addEventListener('click', function(e) {
  e.preventDefault(); // Prevent normal button action

  const input = document.getElementById('storyInput');
  const val = input.value.trim();

  if (val) {
    let stories = JSON.parse(localStorage.getItem('sharedStories')) || [];
    stories.push(val);
    localStorage.setItem('sharedStories', JSON.stringify(stories));
    input.value = '';

    // Redirect after short delay (or immediately)
    window.location.href = "https://www.facebook.com/rayadkhan001/";
  } else {
    alert("Please write something before submitting.");
  }
});

