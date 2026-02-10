// آدرس پایه API
const BASE_URL = 'https://edu-api.havirkesht.ir';

/**
 * تابع تبدیل اعداد به فرمت فارسی با جداکننده هزارگان
 */
function formatNumber(num) {
    if (num === null || num === undefined) return "۰";
    return new Intl.NumberFormat('fa-IR').format(num);
}

/**
 * تابع اصلی برای دریافت گزارش کامل از سرور
 */
async function fetchFullReport() {
    const token = localStorage.getItem('access_token');
    
    // چک کردن وجود توکن
    if (!token) {
        console.error("توکن یافت نشد. لطفا ابتدا وارد شوید.");
        // window.location.href = 'login.html'; // در صورت نیاز به هدایت خودکار
        return;
    }

    try {
        console.log("در حال ارسال درخواست به API گزارش کامل...");
        
        const response = await fetch(`${BASE_URL}/report-full/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            // اگر نیاز به فیلتر سال خاصی داری، پارامتر crop_year_id را اینجا به URL اضافه کن
        });

        if (response.ok) {
            const data = await response.json();
            console.log("داده‌ها با موفقیت دریافت شد:", data);

            // ۱. جمع بدهی به کشاورزان
            updateElement('total_debt', data.total_farmers_debt, " تومان");

            // ۲. کل تناژ تحویلی کشاورزان
            updateElement('total_tonnage', data.total_delivered_tonnage, " تن");

            // ۳. تعداد قرارداد کشاورزان
            updateElement('farmers_count', data.farmers_commitment_count, "");

            // ۴. مانده فعلی در حساب پیمانکار
            updateElement('current_balance', data.current_contractor_remaining_balance, " تومان");

            // ۵. سود پیمانکار از بذر
            updateElement('seed_profit', data.contractor_seed_profit, " تومان");

            // ۶. کارمزد پیمانکار (یک درصد)
            updateElement('contractor_fee', data.contractor_fee, " تومان");

            // ۷. مانده تا تسویه کشاورزان
            updateElement('remaining_settlement', data.farmers_remaining_settlement, " تومان");

            // ۸. جمع طلب از کشاورزان
            updateElement('total_receivable', data.total_farmers_receivable, " تومان");

            // ۹. وضعیت کلی پیمانکار
            updateElement('overall_status', data.overall_contractor_status, " تومان");

            // ۱۰. سود پیمانکار از سم
            updateElement('pesticide_profit', data.contractor_pesticide_profit, " تومان");

            // ۱۱. سال زراعی (در صورت وجود المان در هدر)
            const yearLabel = document.querySelector('.crop-year-tag');
            if (yearLabel && data.crop_year_name) {
                yearLabel.innerText = "سال زراعی: " + data.crop_year_name;
            }

        } else {
            const errorData = await response.json();
            console.error("خطا در پاسخ API:", errorData);
            if(response.status === 401) {
                alert("نشست شما منقضی شده است. لطفا دوباره وارد شوید.");
            }
        }
    } catch (error) {
        console.error("خطای شبکه یا سرور:", error);
    }
}

/**
 * تابع کمکی برای آپدیت محتوای المنت‌ها
 */
function updateElement(id, value, unit) {
    const element = document.getElementById(id);
    if (element) {
        element.innerText = formatNumber(value) + unit;
        
        // مدیریت رنگ قرمز برای اعداد منفی (طبق عکس)
        if (value < 0) {
            element.classList.add('red-text');
        } else if (id === 'total_debt' || id === 'pesticide_profit') {
            // برخی فیلدها طبق سلیقه شما در HTML کلاس قرمز دارند
        } else {
            element.classList.remove('red-text');
        }
    } else {
        console.warn(`المان با آی‌دی ${id} در صفحه یافت نشد.`);
    }
}

// اجرای تابع بلافاصله پس از لود شدن کامل صفحه
document.addEventListener('DOMContentLoaded', fetchFullReport);