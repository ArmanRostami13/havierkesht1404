const BASE_URL = 'https://edu-api.havirkesht.ir';

const loginForm = document.getElementById('loginForm');
const messageElement = document.getElementById('message');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
        // غیرفعال کردن دکمه و نمایش وضعیت انتظار
        submitBtn.disabled = true;
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
            if (data.access_token) {
                localStorage.setItem('access_token', data.access_token);
                messageElement.style.color = "#2ecc71";
                messageElement.innerText = "ورود موفق! در حال انتقال...";
                window.location.href = '/dashboard.html';
            } else {
                messageElement.style.color = "#e74c3c";
                messageElement.innerText = "خطا: توکن معتبر دریافت نشد.";
            }
        } else {
            // مدیریت خطاهای سمت سرور (مثل رمز اشتباه)
            messageElement.style.color = "#e74c3c";
            if (response.status === 401) {
                messageElement.innerText = "نام کاربری یا رمز عبور اشتباه است.";
            } else {
                messageElement.innerText = "خطا در برقراری ارتباط با سرور (" + response.status + ")";
            }
        }
    } catch (error) {
        // مدیریت خطاهای شبکه یا فیلترشکن
        console.error("Network Error:", error);
        messageElement.style.color = "#e74c3c";
        messageElement.innerText = "خطا در شبکه! لطفاً فیلترشکن خود را بررسی کنید.";
    } finally {
        // فعال کردن مجدد دکمه در هر حالت (موفق یا شکست)
        submitBtn.disabled = false;
    }
});