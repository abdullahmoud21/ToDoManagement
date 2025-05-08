document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const userName = document.getElementById('userName').value;
  const phoneNumber = document.getElementById('phoneNumber').value;
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;

  // Client-side validation
  if (!email || !password || !userName || !firstName || !lastName) {
    document.getElementById('registerResult').textContent = "Please fill in all required fields.";
    return;
  }

  if (password !== confirmPassword) {
    document.getElementById('registerResult').textContent = "Passwords do not match.";
    return;
  }

  try {
    const response = await fetch('https://localhost:7254/api/Account/Register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        userName,
        phoneNumber,
        firstName,
        lastName
      }),
      credentials: 'include'
    });

    console.log('Register response status:', response.status, response.statusText);
    console.log('Register response headers:', [...response.headers.entries()]);

    if (response.ok) {
      document.getElementById('registerResult').textContent = "Registration successful! Redirecting to login...";
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } else {
      const errorText = await response.text();
      document.getElementById('registerResult').textContent = errorText || "Registration failed.";
      console.error('Registration error:', errorText);
    }
  } catch (err) {
    document.getElementById('registerResult').textContent = "Something went wrong. Please try again.";
    console.error('Register fetch error:', err);
  }
});