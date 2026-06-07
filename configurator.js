const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const dataDirDev = path.resolve(__dirname, 'backend/data-dev/features.json');
const licensePath = path.resolve(__dirname, 'backend/data-dev/license.key');

function askMode() {
    console.clear();
    console.log('====================================');
    console.log('    MINI POS - QUẢN LÝ GÓI & BẢN QUYỀN');
    console.log('====================================\n');
    console.log('1. Cấu hình gói để Test (Môi trường DEV)');
    console.log('2. Sinh mã Kích hoạt (License Key) cho máy Khách (PRD)');
    console.log('3. Thoát');
    
    rl.question('\nChọn chức năng (1/2/3): ', (answer) => {
        if (answer === '1') return checkAndLoadDev();
        if (answer === '2') return generateLicenseMode();
        if (answer === '3') {
            console.log('Tạm biệt!');
            return rl.close();
        }
        console.log('Lựa chọn không hợp lệ.');
        setTimeout(askMode, 1000);
    });
}

function checkAndLoadDev() {
    if (!fs.existsSync(dataDirDev)) {
        console.log(`\n[LỖI] Không tìm thấy file: ${dataDirDev}`);
        console.log(`Vui lòng chạy dự án (npm run dev) ít nhất 1 lần để hệ thống tự tạo file cấu hình DEV.`);
        rl.question('\nNhấn Enter để quay lại...', () => {
            askMode();
        });
        return;
    }
    mainMenu(dataDirDev, false);
}

function generateLicenseMode() {
    console.clear();
    console.log(`====================================`);
    console.log(`  SINH MÃ KÍCH HOẠT (LICENSE KEY) CHO PRD`);
    console.log(`====================================\n`);
    
    const tempFilePath = path.resolve(__dirname, 'backend/data-dev/.temp_features.json');
    let baseFeatures = {
        "ENABLE_SHIFT_MANAGEMENT": false,
        "ENABLE_PAYMENT_METHODS": true,
        "ENABLE_TABLE_MANAGEMENT": false,
        "ENABLE_INVENTORY": false,
        "ENABLE_LOYALTY": false,
        "ENABLE_PROMOTIONS": false
    };
    
    // Copy existing dev structure as base if available
    if (fs.existsSync(dataDirDev)) {
        try {
            baseFeatures = JSON.parse(fs.readFileSync(dataDirDev, 'utf8'));
        } catch(e) {}
    }
    
    // Ensure parent dir exists
    const dir = path.dirname(tempFilePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive:true});
    
    fs.writeFileSync(tempFilePath, JSON.stringify(baseFeatures));
    mainMenu(tempFilePath, true);
}

function mainMenu(filePath, isLicenseMode) {
    console.clear();
    const rawData = fs.readFileSync(filePath);
    let features = JSON.parse(rawData);
    
    console.log(`====================================`);
    if (isLicenseMode) {
        console.log(`  ĐANG CHỌN GÓI ĐỂ SINH LICENSE KEY`);
    } else {
        console.log(`  ĐANG CẤU HÌNH GÓI TÍNH NĂNG (DEV)`);
    }
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
    
    console.log(`\n${keys.length + 1}. \x1b[36m<-- Quay lại menu chính\x1b[0m`);
    
    const actionText = isLicenseMode ? "TẠO LICENSE KEY" : "LƯU & THOÁT";
    console.log(`${keys.length + 2}. \x1b[33m[${actionText}]\x1b[0m`);
    
    rl.question('\nNhập số (để BẬT/TẮT) hoặc B/P/M (để CHỌN GÓI): ', (answer) => {
        const choice = answer.trim().toUpperCase();
        
        let shouldRefresh = false;
        
        if (choice === 'B') {
            features = {
                "ENABLE_SHIFT_MANAGEMENT": false,
                "ENABLE_PAYMENT_METHODS": true,
                "ENABLE_TABLE_MANAGEMENT": false,
                "ENABLE_INVENTORY": false,
                "ENABLE_LOYALTY": false,
                "ENABLE_PROMOTIONS": false
            };
            shouldRefresh = true;
            console.log('\n-> Đã chọn GÓI BASIC!');
        } else if (choice === 'P') {
            features = {
                "ENABLE_SHIFT_MANAGEMENT": true,
                "ENABLE_PAYMENT_METHODS": true,
                "ENABLE_TABLE_MANAGEMENT": true,
                "ENABLE_INVENTORY": false,
                "ENABLE_LOYALTY": false,
                "ENABLE_PROMOTIONS": true
            };
            shouldRefresh = true;
            console.log('\n-> Đã chọn GÓI PRO!');
        } else if (choice === 'M') {
            features = {
                "ENABLE_SHIFT_MANAGEMENT": true,
                "ENABLE_PAYMENT_METHODS": true,
                "ENABLE_TABLE_MANAGEMENT": true,
                "ENABLE_INVENTORY": true,
                "ENABLE_LOYALTY": true,
                "ENABLE_PROMOTIONS": true
            };
            shouldRefresh = true;
            console.log('\n-> Đã chọn GÓI PREMIUM!');
        }

        if (shouldRefresh) {
            fs.writeFileSync(filePath, JSON.stringify(features, null, 4));
            return setTimeout(() => mainMenu(filePath, isLicenseMode), 1000);
        }

        const num = parseInt(answer);
        if (num > 0 && num <= keys.length) {
            const key = keys[num - 1];
            features[key] = !features[key]; // Toggle
            fs.writeFileSync(filePath, JSON.stringify(features, null, 4));
            mainMenu(filePath, isLicenseMode); // Refresh menu
        } else if (num === keys.length + 1) {
            if (isLicenseMode) fs.unlinkSync(filePath); // clean temp
            askMode();
        } else if (num === keys.length + 2) {
            if (isLicenseMode) {
                // Encode to Base64
                const finalFeatures = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                const jsonString = JSON.stringify(finalFeatures);
                // Add a simple salt or just base64 encode
                const b64 = Buffer.from(jsonString).toString('base64');
                fs.writeFileSync(licensePath, b64);
                fs.unlinkSync(filePath); // clean temp
                console.log(`\n[THÀNH CÔNG] Đã tạo file mã kích hoạt tại: ${licensePath}`);
                console.log(`Bạn có thể chạy Deploy, hoặc gửi file này cho khách hàng chép đè vào C:\\MiniPOS\\data\\`);
            } else {
                console.log('\n[THÀNH CÔNG] Đã lưu cấu hình DEV!');
            }
            rl.close();
        } else {
            mainMenu(filePath, isLicenseMode);
        }
    });
}

// Start
askMode();
