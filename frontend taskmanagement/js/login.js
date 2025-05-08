document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const response = await fetch('https://localhost:7254/api/Account/Login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send cookies
        body: JSON.stringify({
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            rememberMe: document.getElementById('rememberMe').checked
        })
    });

    if (response.ok) {
        window.location.href = '/frontend taskmanagement/html/index.html'; 
    } else {
        const error = await response.json();
        alert(error.error || "Login failed");
    }
});