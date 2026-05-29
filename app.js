// To-Do List Application with Local Storage

class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.editingId = null;
        this.storageKey = 'todoAppTasks';
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Add task
        document.getElementById('addBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // Clear buttons
        document.getElementById('clearCompleted').addEventListener('click', () => this.clearCompleted());
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
    }

    addTask() {
        const input = document.getElementById('taskInput');
        const text = input.value.trim();

        if (!text) {
            alert('Please enter a task!');
            return;
        }

        if (text.length > 200) {
            alert('Task is too long (max 200 characters)');
            return;
        }

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toLocaleString()
        };

        this.tasks.push(task);
        this.saveToStorage();
        input.value = '';
        input.focus();
        this.render();
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveToStorage();
            this.render();
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveToStorage();
            this.render();
        }
    }

    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (!task) return;

        const newText = prompt('Edit task:', task.text);
        if (newText !== null && newText.trim()) {
            task.text = newText.trim();
            this.saveToStorage();
            this.render();
        }
    }

    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            alert('No completed tasks to clear!');
            return;
        }

        if (confirm(`Clear ${completedCount} completed task(s)?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveToStorage();
            this.render();
        }
    }

    clearAll() {
        if (this.tasks.length === 0) {
            alert('No tasks to clear!');
            return;
        }

        if (confirm('Clear all tasks? This cannot be undone.')) {
            this.tasks = [];
            this.saveToStorage();
            this.render();
        }
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    updateStats() {
        const total = this.tasks.length;
        const active = this.tasks.filter(t => !t.completed).length;
        const completed = this.tasks.filter(t => t.completed).length;

        document.getElementById('totalTasks').textContent = `Total: ${total}`;
        document.getElementById('activeTasks').textContent = `Active: ${active}`;
        document.getElementById('completedTasks').textContent = `Completed: ${completed}`;
    }

    render() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        // Update stats
        this.updateStats();

        // Clear task list
        taskList.innerHTML = '';

        // Show/hide empty state
        if (filteredTasks.length === 0) {
            emptyState.classList.add('show');
            taskList.style.display = 'none';
            return;
        }

        emptyState.classList.remove('show');
        taskList.style.display = 'block';

        // Render tasks
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="app.toggleTask(${task.id})"
                >
                <div class="task-content">
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                    <span class="task-date">${task.createdAt}</span>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" onclick="app.editTask(${task.id})">Edit</button>
                    <button class="delete-btn" onclick="app.deleteTask(${task.id})">Delete</button>
                </div>
            `;
            taskList.appendChild(li);
        });

        // Update button states
        const completedCount = this.tasks.filter(t => t.completed).length;
        document.getElementById('clearCompleted').disabled = completedCount === 0;
        document.getElementById('clearAll').disabled = this.tasks.length === 0;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
    }

    loadFromStorage() {
        const stored = localStorage.getItem(this.storageKey);
        this.tasks = stored ? JSON.parse(stored) : [];
    }
}

// Initialize the app
const app = new TodoApp();
