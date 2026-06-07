const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const dataDirDev = path.resolve(__dirname, 'backend/data-dev/features.json');

function checkAndLoad() {
    if (!fs.existsSync(dataDirDev)) {
        console.log(`\n[LỖI] Không tìm thấy file: ${dataDirDev}`);
        console.log(`Vui lòng chạy dự án (npm run dev) ít nhất 1 lần để hệ thống tự tạo file cấu hình.`);
        rl.question('\nNhấn Enter để thoát...', () => {
            rl.close();
        });
        return;
    }
    mainMenu();
}

function mainMenu() {
    console.clear();
    const rawData = fs.readFileSync(dataDirDev);
    let features = JSON.parse(rawData);
    
    console.log(`====================================`);
    console.log(`  CẤU HÌNH GÓI TÍNH NĂNG (DEV & PRD)`);
    console.log(`====================================\n`);
    
    const keys = Object.keys(features);
    keys.forEach((key, index) => {
        const status = features[key] ? '\x1b[32m[ BẬT ]\x1b[0m' : '\x1b[31m[ TẮT ]\x1b[0m';
        console.log(`${index + 1}. ${status} - ${key}`);
    });
    console.log(`\n--- CHỌN NHANH THEO GÓI ---`);
    console.log(`B. \x1b[35mGói BASIC\x1b[0m   (Bán Takeaway, QR)`);
    console.log(`P. \x1b[34mGói PRO\x1b[0m     (Basic + Ca làm việc, Sơ đồ bàn, Voucher)`);
    console.log(`M. \x1b[31mGói PREMIUM\x1b[0m (Pro + Tích điểm Loyalty, Quản lý kho)`);
    
    console.log(`\n${keys.length + 1}. \x1b[33m[LƯU & THOÁT]\x1b[0m`);
    
    rl.question('\nNhập số (để BẬT/TẮT) hoặc B/P/M (để CHỌN GÓI): ', (answer) => {
        const choice = answer.trim().toUpperCase();
        
        if (choice === 'B') {
            features = {
                "ENABLE_SHIFT_MANAGEMENT": false,
                "ENABLE_PAYMENT_METHODS": true,
                "ENABLE_TABLE_MANAGEMENT": false,
                "ENABLE_INVENTORY": false,
                "ENABLE_LOYALTY": false,
                "ENABLE_PROMOTIONS": false
            };
            fs.writeFileSync(dataDirDev, JSON.stringify(features, null, 4));
            console.log('\n-> Đã áp dụng GÓI BASIC!');
            return setTimeout(() => mainMenu(), 1000);
        }
        
        if (choice === 'P') {
            features = {
                "ENABLE_SHIFT_MANAGEMENT": true,
                "ENABLE_PAYMENT_METHODS": true,
                "ENABLE_TABLE_MANAGEMENT": true,
                "ENABLE_INVENTORY": false,
                "ENABLE_LOYALTY": false,
                "ENABLE_PROMOTIONS": true
            };
            fs.writeFileSync(dataDirDev, JSON.stringify(features, null, 4));
            console.log('\n-> Đã áp dụng GÓI PRO!');
            return setTimeout(() => mainMenu(), 1000);
        }
        
        if (choice === 'M') {
            features = {
                "ENABLE_SHIFT_MANAGEMENT": true,
                "ENABLE_PAYMENT_METHODS": true,
                "ENABLE_TABLE_MANAGEMENT": true,
                "ENABLE_INVENTORY": true,
                "ENABLE_LOYALTY": true,
                "ENABLE_PROMOTIONS": true
            };
            fs.writeFileSync(dataDirDev, JSON.stringify(features, null, 4));
            console.log('\n-> Đã áp dụng GÓI PREMIUM!');
            return setTimeout(() => mainMenu(), 1000);
        }

        const num = parseInt(answer);
        if (num > 0 && num <= keys.length) {
            const key = keys[num - 1];
            features[key] = !features[key]; // Toggle
            fs.writeFileSync(dataDirDev, JSON.stringify(features, null, 4));
            mainMenu(); // Refresh menu
        } else if (num === keys.length + 1) {
            console.log('\nĐã lưu cấu hình thành công!');
            rl.close();
        } else {
            mainMenu();
        }
    });
}

// Start
checkAndLoad();
