const API_BASE_URL = 'https://edu-api.havirkesht.ir';

async function fetchUsers(searchTerm = '') {
    const token = localStorage.getItem('access_token');
    const container = document.getElementById('usersList');

    if (!token) {
        window.location.replace('index.html');
        return;
    }

    try {
        // ساخت آدرس طبق مستندات: /users/?page=1&size=50
        let url = `${API_BASE_URL}/users/?page=1&size=50`;
        if (searchTerm) {
            url += `&search=${encodeURIComponent(searchTerm)}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (response.status === 401) {
            localStorage.clear();
            window.location.replace('index.html');
            return;
        }

        const data = await response.json();
        
        // طبق مستندات شما: لیست در data.items قرار دارد
        const users = data.items || [];

        if (users.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">هیچ کاربری یافت نشد.</p>';
            return;
        }

        container.innerHTML = users.map(u => {
            // نمایش وضعیت بر اساس فیلد disabled
            const statusClass = u.disabled ? 'badge-warning' : 'badge-success';
            const statusText = u.disabled ? 'غیرفعال' : 'فعال';
            const initial = u.fullname ? u.fullname.charAt(0).toUpperCase() : (u.username ? u.username.charAt(0).toUpperCase() : 'U');

            return `
                <div class="user-card" style="background:white; padding:25px; border-radius:15px; text-align:center; box-shadow:0 4px 15px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; transition: transform 0.3s;">
                    <div style="width:70px; height:70px; background:linear-gradient(135deg, #4CAF50, #2E7D32); color:white; border-radius:50%; margin:0 auto 15px; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:bold;">
                        ${initial}
                    </div>
                    <h3 style="font-size:16px; margin-bottom:5px; color:#333;">${u.fullname || u.username}</h3>
                    <p style="font-size:13px; color:#888; margin-bottom:10px;">${u.email || 'بدون ایمیل'}</p>
                    <p style="font-size:12px; color:#aaa; margin-bottom:15px; direction:ltr;">${u.phone_number || '---'}</p>
                    <div style="margin-bottom: 20px;">
                        <span class="badge ${statusClass}">${statusText}</span>
                    </div>
                    <div class="card-actions" style="display:flex; justify-content:center; gap:10px;">
                        <button class="action-btn btn-edit" style="background:#e3f2fd; color:#1976d2; border:none; padding:5px 15px; border-radius:8px; cursor:pointer;">ویرایش</button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('User Load Error:', error);
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red;">خطا در دریافت اطلاعات از سرور!</p>';
    }
}

// مدیریت جستجوی هوشمند
let searchTimeout;
document.getElementById('userSearch')?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchUsers(e.target.value);
    }, 500);
});

// دکمه خروج
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.replace('index.html');
});

// بارگذاری اولیه
document.addEventListener('DOMContentLoaded', () => fetchUsers());