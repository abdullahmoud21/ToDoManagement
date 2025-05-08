const apiUrl = 'https://localhost:7254/api/ToDo';

// Validate GUID format (e.g., 123e4567-e89b-12d3-a456-426614174000)
function isValidGuid(id) {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return guidRegex.test(id);
}

function formatDate(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    const dateTimeStr = `${dateStr}T${timeStr}:00`;
    const d = new Date(dateTimeStr);
    return isNaN(d.getTime()) ? null : d.toISOString();
}

function parseDateTime(isoString) {
    if (!isoString) return { date: '', time: '' };
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { date: '', time: '' };
    const date = d.toISOString().split('T')[0];
    const time = d.toISOString().split('T')[1].slice(0, 5); // e.g., "14:30"
    return { date, time };
}

function showMessage(text, isError = false) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) {
        console.error('Message div not found');
        return;
    }
    messageDiv.innerHTML = `<div class="alert ${isError ? 'alert-danger' : 'alert-success'}" role="alert">${text}</div>`;
    setTimeout(() => messageDiv.innerHTML = '', 5000);
}

async function fetchValidTaskIds() {
    try {
        console.log(`Fetching task list to verify valid IDs: ${apiUrl}`);
        const response = await fetch(apiUrl);
        if (!response.ok) {
            console.error(`Failed to fetch task list: ${response.status}`);
            return [];
        }
        const tasks = await response.json();
        const ids = tasks.map(task => task.id);
        console.log('Valid task IDs:', ids);
        return ids;
    } catch (err) {
        console.error('Error fetching task list:', err);
        return [];
    }
}

async function loadTask() {
    const loadingDiv = document.getElementById('loading');
    const form = document.getElementById('editTaskForm');
    if (!loadingDiv || !form) {
        console.error('Loading div or form not found');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get('id');

    if (!taskId) {
        loadingDiv.style.display = 'none';
        showMessage('Error: No task ID provided', true);
        console.error('No task ID in URL');
        return;
    }

    if (!isValidGuid(taskId)) {
        loadingDiv.style.display = 'none';
        showMessage(`Error: Task ID ${taskId} is not a valid GUID`, true);
        console.error(`Invalid GUID format: ${taskId}`);
        return;
    }

    // Check valid task IDs
    const validIds = await fetchValidTaskIds();
    if (!validIds.includes(taskId)) {
        loadingDiv.style.display = 'none';
        showMessage(`Error: Task ID ${taskId} not found. Valid IDs: ${validIds.join(', ') || 'none'}`, true);
        console.error(`Task ID ${taskId} not in valid IDs: ${validIds}`);
        return;
    }

    try {
        console.log(`Fetching task with ID: ${taskId}`);
        const response = await fetch(`${apiUrl}/${taskId}`);
        console.log(`Response status: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load task: ${response.status}`);
        }

        const task = await response.json();
        console.log('Task data received:', task);

        // Pre-fill form with fallback values
        document.getElementById('title').value = task.title || '';
        document.getElementById('description').value = task.description || '';
        document.getElementById('status').value = Number.isInteger(task.status) ? task.status : 0;
        document.getElementById('priority').value = Number.isInteger(task.priority) ? task.priority : 0;
        
        const { date, time } = parseDateTime(task.dueDate);
        document.getElementById('dueDate').value = date || '';
        document.getElementById('dueTime').value = time || '';

        console.log('Form fields populated:', {
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: date,
            dueTime: time
        });

        // Show form, hide loading
        loadingDiv.style.display = 'none';
        form.style.display = 'block';

    } catch (err) {
        console.error('Error loading task:', err);
        loadingDiv.style.display = 'none';
        showMessage(`Error loading task data: ${err.message}. Please verify the task ID and API endpoint (${apiUrl}/${taskId}). Valid IDs: ${validIds.join(', ') || 'none'}`, true);
    }
}

document.getElementById('editTaskForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get('id');
    console.log('Form submission started with taskId:', taskId);
    
    if (!taskId) {
        showMessage('Error: No task ID provided', true);
        console.error('No task ID in URL for submit');
        return;
    }

    if (!isValidGuid(taskId)) {
        showMessage(`Error: Task ID ${taskId} is not a valid GUID`, true);
        console.error(`Invalid GUID format for submit: ${taskId}`);
        return;
    }

    const formData = new FormData(e.target);
    const task = {
        id: taskId, // Add the ID to match the controller's expectation
        title: formData.get('title'),
        description: formData.get('description') || null,
        status: parseInt(formData.get('status')),
        priority: parseInt(formData.get('priority')),
        dueDate: formatDate(formData.get('dueDate'), formData.get('dueTime'))
    };
    console.log('Submitting task update:', task);

    if ((formData.get('dueDate') && !formData.get('dueTime')) || (!formData.get('dueDate') && formData.get('dueTime'))) {
        showMessage('Please provide both date and time for Due Date, or leave both empty.', true);
        return;
    }

    try {
        const updateUrl = `${apiUrl}/update/${taskId}`;
        console.log('Sending PUT request to:', updateUrl);
        const response = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });

        console.log(`Update response status: ${response.status}`);
        const responseText = await response.text(); // Capture response body
        console.log('Update response text:', responseText);

        if (!response.ok) {
            throw new Error(`Failed to update task: ${response.status} - ${responseText || 'No details'}`);
        }

        showMessage('Task updated successfully!');
        setTimeout(() => {
            window.location.href = '/frontend taskmanagement/html/index.html';
        }, 2000);

    } catch (err) {
        console.error('Error updating task:', err);
        showMessage(`Error: ${err.message}`, true);
    }
});

document.addEventListener('DOMContentLoaded', loadTask);