let taskIdCounter = 0;

function saveTasks() {
    const columns = document.querySelectorAll('.column');
    const taskData = {};

    columns.forEach(column => {
        const columnId = column.id;
        const taskElements = column.querySelectorAll('.task');

        taskData[columnId] = [];

        taskElements.forEach(task => {
            const taskId = task.id;
            const taskName = task.querySelector('span').textContent;
            const taskDescription = task.querySelector('textarea').value;

            taskData[columnId].push({
                id: taskId,
                name: taskName,
                description: taskDescription
            });
        });
    });

    localStorage.setItem('kanbanTasks', JSON.stringify(taskData));
}

function loadTasks() {
    const savedTasks = localStorage.getItem('kanbanTasks');

    if (savedTasks) {
        const taskData = JSON.parse(savedTasks);

        for (const columnId in taskData) {
            const tasks = taskData[columnId];
            const column = document.getElementById(columnId);

            tasks.forEach(task => {
                const newTask = document.createElement('div');
                newTask.className = 'task';
                newTask.draggable = true;
                newTask.id = task.id;
                newTask.innerHTML = `
                    <span>${task.name}</span>
                    <textarea class="description" style="display: none;">${task.description}</textarea>
                    <div class="task-buttons">
                        <button onclick="editTask(this)">Edit</button>
                        <button onclick="deleteTask(this)">Delete</button>
                    </div>
                `;

                const descriptionButton = document.createElement('button');
                descriptionButton.textContent = 'Description';
                descriptionButton.onclick = () => openDescriptionModal(task.id);
                newTask.querySelector('.task-buttons').appendChild(descriptionButton);

                const tasksContainer = column.querySelector('.tasks');
                tasksContainer.insertBefore(newTask, tasksContainer.firstChild);
            });
        }
    }
}

function addTask(columnId) {
    const column = document.getElementById(columnId);
    const taskInput = column.querySelector('.task-input');
    const taskName = taskInput.value.trim();
    if (!taskName) return;

    const task = document.createElement('div');
    task.className = 'task';
    task.draggable = true;
    task.id = `task-${taskIdCounter++}`;
    task.innerHTML = `
        <span>Task: ${taskName}</span>
        <textarea class="description" style="display: none;"></textarea>
        <div class="task-buttons">
            <button onclick="editTask(this)">Edit</button>
            <button onclick="deleteTask(this)">Delete</button>
        </div>
    `;

    const descriptionButton = document.createElement('button');
    descriptionButton.textContent = 'Description';
    descriptionButton.onclick = () => openDescriptionModal(task.id);
    task.querySelector('.task-buttons').appendChild(descriptionButton);

    taskInput.value = '';

    const tasksContainer = column.querySelector('.tasks');
    tasksContainer.insertBefore(task, tasksContainer.firstChild);

    saveTasks();
}

function editTask(editButton) {
    const task = editButton.parentElement.parentElement;
    const taskName = task.querySelector('span');
    const descriptionField = task.querySelector('textarea');
    const newTaskName = prompt('Edit task:', taskName.textContent);
    if (newTaskName !== null) {
        taskName.textContent = newTaskName;
        saveTasks();
    }
}

function deleteTask(deleteButton) {
    const task = deleteButton.parentElement.parentElement;
    task.remove();
    saveTasks();
}

let draggedTask = null;

function handleDragStart(event) {
    draggedTask = event.target;
    event.dataTransfer.setData('text/plain', event.target.id);
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDragEnter(event) {
    event.preventDefault();
}

function handleDragDrop(event) {
    const column = event.target.closest('.column');

    if (column && draggedTask) {
        const taskId = event.dataTransfer.getData('text/plain');
        const task = document.getElementById(taskId);

        const tasksContainer = column.querySelector('.tasks');

        const mouseY = event.clientY;
        const tasksRect = tasksContainer.getBoundingClientRect();

        if (mouseY < tasksRect.top + tasksRect.height / 2) {
            tasksContainer.insertBefore(task, tasksContainer.firstChild);
        } else {
            tasksContainer.appendChild(task);
        }
    }

    draggedTask = null;
    saveTasks();
}

document.addEventListener('dragstart', handleDragStart);
document.addEventListener('dragover', handleDragOver);
document.addEventListener('dragenter', handleDragEnter);
document.addEventListener('drop', handleDragDrop);

window.addEventListener('load', loadTasks);

// Function to open the description modal
function openDescriptionModal(taskId) {
    const descriptionModal = document.getElementById('description-modal');
    const descriptionTextarea = document.getElementById('description-textarea');
    const saveDescriptionButton = document.getElementById('save-description-button');
    const closeButton = document.querySelector('.close-button');

    // Find the task element by taskId
    const task = document.getElementById(taskId);
    const taskDescriptionTextarea = task.querySelector('textarea');

    // Populate the description textarea with the current task's description
    descriptionTextarea.value = taskDescriptionTextarea.value;

    // Show the description modal
    descriptionModal.style.display = 'flex';

    // Function to close the description modal
    closeButton.onclick = function () {
        descriptionModal.style.display = 'none';
    };

    // Function to save the updated description
    saveDescriptionButton.onclick = function () {
        // Get the updated description from the textarea
        const updatedDescription = descriptionTextarea.value;

        // Update the task's description
        taskDescriptionTextarea.value = updatedDescription;

        // Hide the description modal
        descriptionModal.style.display = 'none';

        // Save tasks to localStorage
        saveTasks();
    };
}