const apiUrl = 'https://localhost:7254/api/ToDo/create';

        function formatDate(dateStr, timeStr) {
            if (!dateStr || !timeStr) return null;
            const dateTimeStr = `${dateStr}T${timeStr}:00`;
            const d = new Date(dateTimeStr);
            return isNaN(d.getTime()) ? null : d.toISOString();
        }

        function showMessage(text, isError = false) {
            const messageDiv = document.getElementById('message');
            messageDiv.innerHTML = `<div class="alert ${isError ? 'alert-danger' : 'alert-success'}" role="alert">${text}</div>`;
            setTimeout(() => messageDiv.innerHTML = '', 5000); // Clear after 5 seconds
        }

        document.getElementById('createTaskForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const task = {
                title: formData.get('title'),
                description: formData.get('description') || null,
                status: parseInt(formData.get('status')),
                priority: parseInt(formData.get('priority')),
                dueDate: formatDate(formData.get('dueDate'), formData.get('dueTime'))
            };

            // Validate that dueDate and dueTime are both provided if one is provided
            if ((formData.get('dueDate') && !formData.get('dueTime')) || (!formData.get('dueDate') && formData.get('dueTime'))) {
                showMessage('Please provide both date and time for Due Date, or leave both empty.', true);
                return;
            }

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(task)
                });

                if (!response.ok) {
                    throw new Error(`Failed to create task: ${response.status}`);
                }

                showMessage('Task created successfully!');
                e.target.reset(); // Clear the form
                setTimeout(() => {
                    window.location.href = 'index.html'; // Redirect to task list
                }, 2000);

            } catch (err) {
                console.error('Error creating task:', err);
                showMessage(`Error: ${err.message}`, true);
            }
        });