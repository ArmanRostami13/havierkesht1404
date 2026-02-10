/**
 * سامانه مدیریت هاویرکشت
 * بخش داشبورد - نسخه نهایی متصل به API Full Report
 */

const BASE_URL = 'https://edu-api.havirkesht.ir';

// ۱. تابع تبدیل اعداد به فرمت فارسی با جداکننده سه رقم
function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return "۰";
    // Math.abs برای نمایش صحیح اعداد در کنار واحد، علامت منفی را در استایل مدیریت می‌کنیم
    return new Intl.NumberFormat('fa-IR').format(Math.abs(num));
}

// ۲. تابع به‌روزرسانی محتوای کارت‌ها و استایل رنگی
function updateElement(id, value, unit = " تومان") {
    const element = document.getElementById(id);
    if (element) {
        element.innerText = formatNumber(value) + unit;
        
        // اگر مقدار منفی بود (بدهی)، رنگ قرمز اعمال شود
        if (value < 0) {
            element.style.color = "#d32f2f"; // قرمز تیره استاندارد
            element.classList.add('red-text');
        } else {
            element.style.color = ""; // بازگشت به رنگ اصلی
            element.classList.remove('red-text');
        }
    }
}

// ۳. تابع اصلی فراخوانی اطلاعات از سرور
async function fetchFullReport() {
    const token = localStorage.getItem('access_token');
    
    // امنیت: اگر توکن نبود به صفحه ورود برگرد
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // نمایش لودینگ (بررسی وجود کتابخانه برای جلوگیری از خطا)
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'در حال بروزرسانی داده‌ها...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });
        }

        // درخواست POST به Endpoint گزارش جامع طبق مستندات Swagger
        const response = await fetch(`${BASE_URL}/report-full/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
            // پارامتر crop_year_id به صورت Query است و اختیاری، لذا Body ارسال نمی‌شود
        });

        console.log("Response Status:", response.status);

        if (response.ok) {
            const data = await response.json();
            console.log("داده‌های دریافت شده:", data);

            // ۴. نگاشت دقیق فیلدهای API به آی‌دی‌های HTML شما
            // این بخش مطابق با ساختار JSON دریافتی شما تنظیم شده است
            updateElement('total_debt', data.total_farmers_debt);
            updateElement('total_tonnage', data.total_delivered_tonnage, " تن");
            updateElement('farmers_count', data.farmers_commitment_count, " عدد");
            updateElement('current_balance', data.current_contractor_remaining_balance);
            updateElement('seed_profit', data.contractor_seed_profit);
            updateElement('pesticide_profit', data.contractor_pesticide_profit);
            updateElement('contractor_fee', data.contractor_fee);
            updateElement('remaining_settlement', data.farmers_remaining_settlement);
            updateElement('total_receivable', data.total_farmers_receivable);
            updateElement('overall_status', data.overall_contractor_status);

            // آپدیت سال زراعی در هدر
            const yearLabel = document.querySelector('.crop-year-tag');
            if (yearLabel && data.crop_year_name) {
                yearLabel.innerText = "سال زراعی: " + data.crop_year_name;
            }

            if (typeof Swal !== 'undefined') Swal.close();

        } else if (response.status === 401) {
            // توکن منقضی شده
            localStorage.removeItem('access_token');
            if (typeof Swal !== 'undefined') {
                Swal.fire('نشست منقضی شد', 'لطفاً دوباره وارد شوید', 'error').then(() => {
                    window.location.href = 'index.html';
                });
            } else {
                window.location.href = 'index.html';
            }
        } else {
            throw new Error('خطا در دریافت پاسخ از سرور');
        }

    } catch (error) {
        console.error("خطای بارگذاری داشبورد:", error);
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'خطای ارتباط',
                text: 'دریافت گزارش با مشکل مواجه شد. لطفاً دوباره تلاش کنید.',
                confirmButtonText: 'تلاش مجدد'
            });
        }
    }
}

// ۵. اجرای تابع بلافاصله پس از لود شدن کامل سند
document.addEventListener('DOMContentLoaded', fetchFullReport);
// به جای اجرای مستقیم، یک وقفه ۵۰۰ میلی‌ثانیه‌ای می‌گذاریم 
// تا مطمئن شویم مرورگر و تمام سرویس‌ها کاملاً آماده هستند
window.addEventListener('load', () => {
    setTimeout(fetchFullReport, 500);
});