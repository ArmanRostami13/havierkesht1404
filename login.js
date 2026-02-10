const BASE_URL = 'https://edu-api.havirkesht.ir';

const loginForm = document.getElementById('loginForm');
const messageElement = document.getElementById('message');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
        messageElement.style.color = "#3498db";
        messageElement.innerText = "در حال برقراری ارتباط...";

        const response = await fetch(`${BASE_URL}/token`, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access_token);
            window.location.href = 'dashboard.html';
        } else {
            messageElement.style.color = "#e74c3c";
            messageElement.innerText = "نام کاربری یا رمز عبور اشتباه است.";
        }
    } catch (error) {
        console.log("Error:", error);
        messageElement.style.color = "#e74c3c";
        messageElement.innerText = "خطا در شبکه! فیلترشکن را بررسی کنید.";
    }
});