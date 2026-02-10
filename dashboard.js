const BASE_URL = 'https://edu-api.havirkesht.ir';

function formatNumber(num) {
    if (num === null || num === undefined) return "۰";
    return new Intl.NumberFormat('fa-IR').format(num);
}

async function fetchFullReport() {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
        console.error("توکن یافت نشد.");
        return;
    }

    try {
        console.log("در حال ارسال درخواست به API...");
        const response = await fetch(`${BASE_URL}/report-full/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log("داده‌ها با موفقیت دریافت شد:", data);

            // آپدیت تمام فیلدها با دقت بالا
            updateElement('total_debt', data.total_farmers_debt, " تومان");
            updateElement('total_tonnage', data.total_delivered_tonnage, " تن");
            updateElement('farmers_count', data.farmers_commitment_count, "");
            updateElement('current_balance', data.current_contractor_remaining_balance, " تومان");
            updateElement('seed_profit', data.contractor_seed_profit, " تومان");
            updateElement('pesticide_profit', data.contractor_pesticide_profit, " تومان");
            updateElement('contractor_fee', data.contractor_fee, " تومان");
            updateElement('remaining_settlement', data.farmers_remaining_settlement, " تومان");
            updateElement('total_receivable', data.total_farmers_receivable, " تومان");
            updateElement('overall_status', data.overall_contractor_status, " تومان");

            // آپدیت سال زراعی
            const yearLabel = document.querySelector('.crop-year-tag');
            if (yearLabel && data.crop_year_name) {
                yearLabel.innerText = "سال زراعی: " + data.crop_year_name;
            }

        } else {
            console.error("خطا در پاسخ API");
        }
    } catch (error) {
        console.error("خطای شبکه:", error);
    }
}

function updateElement(id, value, unit) {
    const element = document.getElementById(id);
    if (element) {
        element.innerText = formatNumber(value) + unit;
        // مدیریت رنگ برای اعداد منفی
        if (value < 0) {
            element.style.color = "red";
        }
    }
}

document.addEventListener('DOMContentLoaded', fetchFullReport);