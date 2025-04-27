import { addTask, deleteTask, toggleTaskCompletion, setFilter, setSort, setPage, setSearch, clearSearch } from './task.js';

export function setupEventListeners() {
  const addButton = document.querySelector('.add-btn');
  const titleInput = document.querySelector('.title-input');
  const descInput = document.querySelector('.desc-input');
  const taskList = document.querySelector('.todo-list');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const sortButtons = document.querySelectorAll('.sort-btn');
  const paginationContainer = document.querySelector('.pagination');
  const searchInput = document.querySelector('.search-input');
  const clearSearchButton = document.querySelector('.clear-search-btn');

  // Add task event listeners
  addButton.addEventListener('click', () => {
    addTask(titleInput.value, descInput.value);
  });

  titleInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      addTask(titleInput.value, descInput.value);
    }
  });
  
  // Task list event delegation
  taskList.addEventListener('click', (event) => {
    const target = event.target;
    
    if (target.classList.contains('delete-btn')) {
      const taskId = parseInt(target.dataset.taskId);
      deleteTask(taskId);
    }
    
    if (target.classList.contains('complete-btn')) {
      const taskId = parseInt(target.dataset.taskId);
      toggleTaskCompletion(taskId);
    }
  });

  // Filter button event listeners
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      setFilter(filter);
    });
  });

  // Sort button event listeners
  sortButtons.forEach(button => {
    button.addEventListener('click', () => {
      const sortType = button.dataset.sort;
      setSort(sortType);
    });
  });

  // Search functionality
  searchInput.addEventListener('input', (event) => {
    setSearch(event.target.value);
  });

  clearSearchButton.addEventListener('click', () => {
    clearSearch();
  });

  // Pagination event delegation
  paginationContainer.addEventListener('click', (event) => {
    const target = event.target.closest('.page-btn');
    if (target && !target.disabled) {
      const page = parseInt(target.dataset.page);
      setPage(page);
    }
  });

  // Add input field focus styles
  titleInput.addEventListener('focus', () => {
    titleInput.classList.add('focused');
  });
  titleInput.addEventListener('blur', () => {
    titleInput.classList.remove('focused');
  });
  descInput.addEventListener('focus', () => {
    descInput.classList.add('focused');
  });
  descInput.addEventListener('blur', () => {
    descInput.classList.remove('focused');
  });

  // Add drag and drop functionality
  let draggedItem = null;

  taskList.addEventListener('dragstart', (e) => {
    draggedItem = e.target;
    e.target.classList.add('dragging');
  });

  taskList.addEventListener('dragend', (e) => {
    e.target.classList.remove('dragging');
  });

  taskList.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(taskList, e.clientY);
    const currentDragging = document.querySelector('.dragging');
    if (afterElement) {
      taskList.insertBefore(currentDragging, afterElement);
    } else {
      taskList.appendChild(currentDragging);
    }
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('tr:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}