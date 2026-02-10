/**
 * سامانه مدیریت هاویرکشت - داشبورد مرکزی
 * متصل به Full Report و هماهنگ با سیستم جدید
 */

const BASE_URL = 'https://edu-api.havirkesht.ir';
const CROP_YEAR_ID = 13; 

// ۱. تابع تبدیل اعداد به فرمت فارسی
function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return "۰";
    return new Intl.NumberFormat('fa-IR').format(num);
}

// ۲. تابع به‌روزرسانی کارت‌ها با مدیریت رنگ
function updateElement(id, value, unit = " تومان") {
    const element = document.getElementById(id);
    if (!element) return;

    element.innerText = formatNumber(value) + unit;
    
    // قرمز کردن اعداد منفی
    if (value < 0) {
        element.style.color = "#d32f2f";
    } else if (id.includes('profit') || id.includes('fee')) {
        element.style.color = "#2e7d32"; // سبز برای سود و کارمزد
    }
}

// ۳. دریافت اطلاعات از Full Report
async function fetchFullReport() {
    const token = localStorage.getItem('access_token');
    if (!token) { window.location.replace('index.html'); return; }

    try {
        const response = await fetch(`${BASE_URL}/report-full/?crop_year_id=${CROP_YEAR_ID}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            localStorage.clear();
            window.location.replace('index.html');
            return;
        }

        const data = await response.json();

        // نگاشت به کارت‌های HTML
        updateElement('total_debt', data.total_farmers_debt);
        updateElement('total_tonnage', data.total_delivered_tonnage, " تن");
        updateElement('farmers_count', data.farmers_commitment_count, " نفر");
        updateElement('current_balance', data.current_contractor_remaining_balance);
        updateElement('seed_profit', data.contractor_seed_profit);
        updateElement('pesticide_profit', data.contractor_pesticide_profit);
        updateElement('contractor_fee', data.contractor_fee);
        updateElement('remaining_settlement', data.farmers_remaining_settlement);
        updateElement('overall_status', data.overall_contractor_status);

        // آپدیت سال زراعی در هدر
        const yearDisplay = document.getElementById('year_value');
        if (yearDisplay && data.crop_year_name) {
            yearDisplay.innerText = data.crop_year_name;
        }

    } catch (error) {
        console.error("خطا در دریافت گزارش:", error);
    }
}

// ۴. مدیریت خروج
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.replace('index.html');
});

// اجرا
document.addEventListener('DOMContentLoaded', fetchFullReport);