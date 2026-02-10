const BASE_URL = 'https://edu-api.havirkesht.ir';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');
        const submitBtn = loginForm.querySelector('.btn-submit');

        const formData = new URLSearchParams();
        formData.append('username', usernameField.value);
        formData.append('password', passwordField.value);

        try {
            submitBtn.disabled = true;
            
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'در حال بررسی...',
                    allowOutsideClick: false,
                    didOpen: () => { Swal.showLoading(); }
                });
            }

            // تغییر آدرس به /token بر اساس مستندات فرستاده شده
            const response = await fetch(`${BASE_URL}/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('access_token', data.access_token);
                
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: 'ورود موفق',
                        text: 'در حال انتقال به داشبورد...',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = 'dashboard.html';
                    });
                } else {
                    window.location.href = 'dashboard.html';
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "نام کاربری یا رمز عبور اشتباه است");
            }

        } catch (error) {
            console.error("Login Error:", error);
            if (typeof Swal !== 'undefined') {
                Swal.fire('خطا', error.message, 'error');
            } else {
                document.getElementById('message').innerText = error.message;
            }
        } finally {
            submitBtn.disabled = false;
        }
    });
});