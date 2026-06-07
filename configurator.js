const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const dataDirDev = path.resolve(__dirname, 'backend/data-dev/features.json');
const dataDirPrd = path.resolve(__dirname, 'backend/data/features.json');

function askEnv() {
    console.clear();
    console.log('====================================');
    console.log('    MINI POS - TOOL CẤU HÌNH GÓI    ');
    console.log('====================================\n');
    console.log('1. Môi trường Thực tế (Production)');
    console.log('2. Môi trường Thử nghiệm (Development)');
    console.log('3. Thoát');
    
    rl.question('\nChọn môi trường (1/2/3): ', (answer) => {
        if (answer === '1') return checkAndLoad(dataDirPrd, 'Production');
        if (answer === '2') return checkAndLoad(dataDirDev, 'Development');
        if (answer === '3') {
            console.log('Tạm biệt!');
            return rl.close();
        }
        console.log('Lựa chọn không hợp lệ.');
        setTimeout(askEnv, 1000);
    });
}

function checkAndLoad(filePath, envName) {
    if (!fs.existsSync(filePath)) {
        console.log(`\n[LỖI] Không tìm thấy file: ${filePath}`);
        console.log(`Vui lòng chạy dự án ít nhất 1 lần để hệ thống tự động tạo file cấu hình.`);
        rl.question('\nNhấn Enter để quay lại...', () => {
            askEnv();
        });
        return;
    }
    mainMenu(filePath, envName);
}

function mainMenu(filePath, envName) {
    console.clear();
    const rawData = fs.readFileSync(filePath);
    let features = JSON.parse(rawData);
    
    console.log(`====================================`);
    console.log(`  ĐANG CẤU HÌNH: ${envName.toUpperCase()}`);
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
    
    console.log(`\n${keys.length + 1}. \x1b[36m<-- Quay lại chọn môi trường\x1b[0m`);
    console.log(`${keys.length + 2}. \x1b[33m[LƯU & THOÁT]\x1b[0m`);
    
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
            fs.writeFileSync(filePath, JSON.stringify(features, null, 4));
            console.log('\n-> Đã áp dụng GÓI BASIC!');
            return setTimeout(() => mainMenu(filePath, envName), 1000);
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
            fs.writeFileSync(filePath, JSON.stringify(features, null, 4));
            console.log('\n-> Đã áp dụng GÓI PRO!');
            return setTimeout(() => mainMenu(filePath, envName), 1000);
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
            fs.writeFileSync(filePath, JSON.stringify(features, null, 4));
            console.log('\n-> Đã áp dụng GÓI PREMIUM!');
            return setTimeout(() => mainMenu(filePath, envName), 1000);
        }

        const num = parseInt(answer);
        if (num > 0 && num <= keys.length) {
            const key = keys[num - 1];
            features[key] = !features[key]; // Toggle
            fs.writeFileSync(filePath, JSON.stringify(features, null, 4));
            mainMenu(filePath, envName); // Refresh menu
        } else if (num === keys.length + 1) {
            askEnv();
        } else if (num === keys.length + 2) {
            console.log('\nĐã lưu cấu hình thành công!');
            rl.close();
        } else {
            mainMenu(filePath, envName);
        }
    });
}

// Start
askEnv();
