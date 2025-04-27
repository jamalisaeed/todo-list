// Task structure
class Task {
    constructor(title, description = '', completed = false) {
        this.id = Date.now();
        this.title = title;
        this.description = description;
        this.completed = completed;
        this.createdAt = new Date();
    }
}

let currentFilter = 'all';
let currentSort = 'newest';
let currentPage = 1;
let currentSearch = '';
const tasksPerPage = 5;

export function addTask(title, description = '') {
    if (!title || title.trim() === '') {
        showNotification('Please enter a task title');
        return;
    }
    const tasks = getTasks();
    // Prevent duplicate titles (case-insensitive)
    if (tasks.some(task => task.title.trim().toLowerCase() === title.trim().toLowerCase())) {
        showNotification('A task with this title already exists');
        return;
    }
    const task = new Task(title, description);
    tasks.push(task);
    saveTasks(tasks);
    renderTasks();
    clearInput();
    updateTaskCount();
}

export function deleteTask(taskId) {
    const tasks = getTasks();
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
    renderTasks();
    updateTaskCount();
}

export function toggleTaskCompletion(taskId) {
    const tasks = getTasks();
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks(tasks);
        renderTasks();
        updateTaskCount();
    }
}

export function setFilter(filter) {
    currentFilter = filter;
    currentPage = 1; // Reset to first page when filter changes
    renderTasks();
    updateTaskCount();
    updateFilterButtons(filter);
}

export function setSort(sortType) {
    currentSort = sortType;
    renderTasks();
    updateSortButtons(sortType);
}

export function setPage(page) {
    currentPage = page;
    renderTasks();
    updatePagination();
}

export function setSearch(searchText) {
    currentSearch = searchText.toLowerCase();
    currentPage = 1; // Reset to first page when search changes
    renderTasks();
    updateTaskCount();
    updatePagination();
    updateClearSearchButton();
}

export function clearSearch() {
    const searchInput = document.querySelector('.search-input');
    searchInput.value = '';
    setSearch('');
}

export function loadTasks() {
    renderTasks();
    updateTaskCount();
    updatePagination();
}

// Helper functions
function getTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    const taskList = document.querySelector('.todo-list tbody');
    const tasks = getTasks();
    const filteredTasks = filterTasks(tasks);
    const searchedTasks = searchTasks(filteredTasks);
    const sortedTasks = sortTasks(searchedTasks);
    const paginatedTasks = paginateTasks(sortedTasks);
    
    taskList.innerHTML = '';
    paginatedTasks.forEach(task => {
        const row = taskList.insertRow();
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const cell3 = row.insertCell(2);
        
        cell1.innerHTML = `
            <span class="task-text ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                ${highlightSearchText(task.title)}
            </span>
        `;
        cell2.innerHTML = task.description ? `<span class="task-desc">${task.description}</span>` : '';
        cell3.className = 'actions';
        cell3.innerHTML = `
            <button class="complete-btn" data-task-id="${task.id}">
                ${task.completed ? '<i class=\'fas fa-undo\'></i>' : '<i class=\'fas fa-check\'></i>'}
            </button>
            <button class="delete-btn" data-task-id="${task.id}"><i class=\'fas fa-trash\'></i></button>
        `;
    });
}

function filterTasks(tasks) {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

function searchTasks(tasks) {
    if (!currentSearch) return tasks;
    return tasks.filter(task => 
        task.title.toLowerCase().includes(currentSearch) ||
        (task.description && task.description.toLowerCase().includes(currentSearch))
    );
}

function highlightSearchText(text) {
    if (!currentSearch) return text;
    const regex = new RegExp(`(${currentSearch})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function sortTasks(tasks) {
    switch (currentSort) {
        case 'newest':
            return [...tasks].sort((a, b) => b.createdAt - a.createdAt);
        case 'oldest':
            return [...tasks].sort((a, b) => a.createdAt - b.createdAt);
        case 'alphabetical':
            return [...tasks].sort((a, b) => a.title.localeCompare(b.title));
        default:
            return tasks;
    }
}

function paginateTasks(tasks) {
    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    return tasks.slice(startIndex, endIndex);
}

function updateTaskCount() {
    const tasks = getTasks();
    const filteredTasks = filterTasks(tasks);
    const searchedTasks = searchTasks(filteredTasks);
    const activeTasks = searchedTasks.filter(task => !task.completed).length;
    const tasksCountElement = document.querySelector('.tasks-count');
    tasksCountElement.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} remaining`;
}

function updateFilterButtons(activeFilter) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        if (button.dataset.filter === activeFilter) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function updateSortButtons(activeSort) {
    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(button => {
        if (button.dataset.sort === activeSort) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

function updateClearSearchButton() {
    const clearButton = document.querySelector('.clear-search-btn');
    clearButton.style.display = currentSearch ? 'block' : 'none';
}

function updatePagination() {
    const tasks = getTasks();
    const filteredTasks = filterTasks(tasks);
    const searchedTasks = searchTasks(filteredTasks);
    const totalPages = Math.ceil(searchedTasks.length / tasksPerPage);
    const paginationContainer = document.querySelector('.pagination');
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
                ${i}
            </button>
        `;
    }
    
    // Next button
    paginationHTML += `
        <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
}

function clearInput() {
    const titleField = document.querySelector('.title-input');
    const descField = document.querySelector('.desc-input');
    if (titleField) titleField.value = '';
    if (descField) descField.value = '';
    if (titleField) titleField.focus();
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

