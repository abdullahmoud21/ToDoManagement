const apiUrl = 'https://localhost:7254/api/ToDo';

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
}

function getStatus(status) {
    const statusMap = {
        '0': 'Pending',
        '1': 'InProgress',
        '2': 'Completed',
        'Pending': 'Pending',
        'InProgress': 'InProgress',
        'Completed': 'Completed'
    };
    return statusMap[status] || 'Unknown';
}

function getPriority(priority) {
    const priorityMap = {
        '0': 'Low',
        '1': 'Medium',
        '2': 'High',
        'Low': 'Low',
        'Medium': 'Medium',
        'High': 'High'
    };
    return priorityMap[priority] || 'Unknown';
}

function getBadgeClass(value, type) {
    const mappedValue = type === 'status' ? getStatus(value) : getPriority(value);

    if (type === 'status') {
        switch (mappedValue) {
            case 'Pending': return 'bg-warning text-dark';
            case 'InProgress': return 'bg-primary';
            case 'Completed': return 'bg-success';
            default: return 'bg-secondary';
        }
    } else if (type === 'priority') {
        switch (mappedValue) {
            case 'High': return 'bg-danger';
            case 'Medium': return 'bg-info text-dark';
            case 'Low': return 'bg-secondary';
            default: return 'bg-light text-dark';
        }
    }
    return 'bg-light';
}

async function loadTasks() {
    try {
        const tbody = document.querySelector('tbody');
        if (!tbody) {
            console.error('Table body element not found');
            return;
        }
        tbody.innerHTML = '<tr><td colspan="8">Loading...</td></tr>';

        const response = await fetch(`${apiUrl}/getall`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'  // Include cookies in the request
});

        console.log(`Task fetch response status: ${response.status} ${response.statusText}`);
        console.log('Response headers:', [...response.headers.entries()]);
        console.log('CORS check failed. Check console for details.');

        const rawText = await response.text();
        console.log('Raw response:', rawText);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${rawText || 'Unknown error'}`);
        }

        let tasks;
        try {
            tasks = JSON.parse(rawText);
            console.log('Parsed tasks:', tasks);
        } catch (err) {
            console.error('Failed to parse response as JSON:', err);
            throw new Error(`Failed to parse response as JSON. Received: ${rawText}`);
        }

        if (!Array.isArray(tasks)) {
            throw new Error('Response is not an array of tasks');
        }

        tasks.sort((a, b) => {
            const statusA = getStatus(a.status);
            const statusB = getStatus(b.status);

            if (statusA === 'Completed' && statusB !== 'Completed') return 1;
            if (statusA !== 'Completed' && statusB === 'Completed') return -1;

            const priorityA = getPriority(a.priority);
            const priorityB = getPriority(b.priority);
            const priorityOrder = ['High', 'Medium', 'Low'];
            return priorityOrder.indexOf(priorityA) - priorityOrder.indexOf(priorityB);
        });

        tbody.innerHTML = '';

        if (tasks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8">No tasks available</td></tr>';
            return;
        }

        tasks.forEach(task => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${task.title || 'Untitled'}</td>
                <td>${task.description || ''}</td>
                <td><span class="badge ${getBadgeClass(task.status, 'status')}">${getStatus(task.status)}</span></td>
                <td><span class="badge ${getBadgeClass(task.priority, 'priority')}">${getPriority(task.priority)}</span></td>
                <td>${formatDate(task.dueDate)}</td>
                <td>${formatDate(task.createdAt)}</td>
                <td>${formatDate(task.lastModifiedAt)}</td>
                <td>
                    <a href="#" class="btn btn-sm btn-outline-primary edit-task" data-id="${task.id || ''}">Edit</a>
                    <a href="#" class="btn btn-sm btn-outline-danger delete-task" data-id="${task.id || ''}">Delete</a>
                </td>
            `;
            tbody.appendChild(row);
        });

        tbody.addEventListener('click', async (e) => {
            e.preventDefault();
            const target = e.target;
            const taskId = target.dataset.id;

            if (target.classList.contains('edit-task')) {
                if (!taskId) {
                    alert('Error: No task ID provided');
                    return;
                }
                console.log(`Navigating to edit task ID: ${taskId}`);
                window.location.href = `/frontend taskmanagement/html/edit.html?id=${taskId}`;
            } else if (target.classList.contains('delete-task')) {
                if (!taskId) {
                    alert('Error: No task ID provided');
                    return;
                }
                if (confirm('Are you sure you want to delete this task?')) {
                    try {
                        console.log(`Deleting task ID: ${taskId}`);
                        const response = await fetch(`${apiUrl}/delete/${taskId}`, {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include'
                        });
                        console.log(`Delete response status: ${response.status} ${response.statusText}`);
                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`Failed to delete task: ${errorText || 'Unknown error'}`);
                        }
                        await loadTasks();
                    } catch (err) {
                        console.error('Error deleting task:', err);
                        alert(`Error: ${err.message}`);
                    }
                }
            }
        });

    } catch (err) {
        console.error('Error loading tasks:', err.message, err.stack);
        const tbody = document.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="8">Failed to load tasks: ${err.message}</td></tr>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded, initializing task load');
    await loadTasks();
});