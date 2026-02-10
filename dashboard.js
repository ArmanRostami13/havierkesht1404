/**
 * سامانه مدیریت هاویرکشت
 * نسخه نهایی و اصلاح شده - متصل به گزارش جامع (Full Report)
 */

const BASE_URL = 'https://edu-api.havirkesht.ir';
const CROP_YEAR_ID = 13; // پارامتر حیاتی برای دریافت داده‌های واقعی

// ۱. تابع تبدیل اعداد به فرمت فارسی با جداکننده سه رقم و مدیریت علامت منفی
function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return "۰";
    
    // تبدیل به فرمت فارسی استاندارد
    let formatted = new Intl.NumberFormat('fa-IR').format(num);
    return formatted;
}

// ۲. تابع به‌روزرسانی محتوای کارت‌ها
function updateElement(id, value, unit = " تومان") {
    const element = document.getElementById(id);
    if (!element) return;

    // نمایش عدد فرمت شده
    element.innerText = formatNumber(value) + unit;
    
    // مدیریت رنگ برای اعداد منفی (بدهی یا تراز منفی)
    if (value < 0) {
        element.style.color = "#d32f2f"; // قرمز
        element.classList.add('text-danger');
    } else {
        element.style.color = ""; // رنگ پیش‌فرض
        element.classList.remove('text-danger');
    }
}

// ۳. تابع اصلی فراخوانی اطلاعات از سرور
async function fetchFullReport() {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        window.location.replace('index.html');
        return;
    }

    try {
        // نمایش لودینگ (اگر SweetAlert دارید)
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'در حال دریافت اطلاعات...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });
        }

        // درخواست با متد POST همراه با پارامتر سال زراعی در URL
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

        if (!response.ok) throw new Error("خطا در پاسخ سرور");

        const data = await response.json();
        console.log("دیتای دریافت شده:", data);

        // ۴. نگاشت داده‌های API به آی‌دی‌های کارت‌های شما
        updateElement('total_debt', data.total_farmers_debt);
        updateElement('total_tonnage', data.total_delivered_tonnage, " تن");
        updateElement('farmers_count', data.farmers_commitment_count, " نفر");
        updateElement('current_balance', data.current_contractor_remaining_balance);
        updateElement('seed_profit', data.contractor_seed_profit);
        updateElement('contractor_fee', data.contractor_fee);
        updateElement('remaining_settlement', data.farmers_remaining_settlement);
        updateElement('total_receivable', data.total_farmers_receivable);
        updateElement('overall_status', data.overall_contractor_status);
        updateElement('pesticide_profit', data.contractor_pesticide_profit);

        // آپدیت نام سال زراعی اگر المانی دارید
        const yearTag = document.querySelector('.crop-year-tag');
        if (yearTag && data.crop_year_name) {
            yearTag.innerText = "سال زراعی: " + data.crop_year_name;
        }

        if (typeof Swal !== 'undefined') Swal.close();

    } catch (error) {
        console.error("خطای داشبورد:", error);
        if (typeof Swal !== 'undefined') {
            Swal.fire('خطا', 'مشکلی در لود داده‌ها پیش آمد', 'error');
        }
    }
}

// ۵. اجرا بعد از لود کامل صفحه
document.addEventListener('DOMContentLoaded', () => {
    // یک وقفه کوتاه برای اطمینان از آماده بودن DOM
    setTimeout(fetchFullReport, 300);
});

// دکمه خروج
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.replace('index.html');
    });
}