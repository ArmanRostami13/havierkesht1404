const API_BASE_URL = 'https://edu-api.havirkesht.ir';

async function fetchFarmers(searchTerm = '') {
    const token = localStorage.getItem('access_token');
    const tableBody = document.getElementById('farmersList');

    try {
        // ساخت آدرس با پارامترهای مستندات شما
        let url = `${API_BASE_URL}/farmer/?page=1&size=50`;
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
            window.location.href = 'index.html';
            return;
        }

        const data = await response.json();
        
        // طبق مستندات شما: داده‌ها در data.items هستند
        const farmers = data.items || [];

        if (farmers.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">کشاورزی با این مشخصات یافت نشد.</td></tr>';
            return;
        }

        tableBody.innerHTML = farmers.map(farmer => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px;">${farmer.full_name || '---'}</td>
                <td style="padding: 12px;">${farmer.national_id || '---'}</td>
                <td style="padding: 12px;">${farmer.phone_number || '---'}</td>
                <td style="padding: 12px; font-size: 12px; color: #666;">${farmer.address || '---'}</td>
                <td style="padding: 12px;">
                    <button class="action-btn btn-edit" onclick="viewDetails(${farmer.id})">👁️</button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error:', error);
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red; padding: 20px;">خطا در برقراری ارتباط با سرور</td></tr>';
    }
}

// مدیریت جستجو (Debounce برای جلوگیری از درخواست‌های مکرر)
let timeout = null;
document.getElementById('farmerSearch').addEventListener('input', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        fetchFarmers(e.target.value);
    }, 500);
});

// دکمه خروج
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'index.html';
});

// لود اولیه
document.addEventListener('DOMContentLoaded', () => fetchFarmers());