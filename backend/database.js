const fs = require('fs');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const dataDirName = env === 'production' ? 'data' : 'data-dev';
const dataDir = path.resolve(__dirname, dataDirName);

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const collections = ['users', 'categories', 'products', 'orders', 'order_items', 'features', 'shifts', 'tables', 'materials', 'recipes', 'customers', 'vouchers'];
let data = {};

// Khởi tạo DB
collections.forEach(col => {
    if (col === 'features' && env === 'production') {
        const licensePath = path.join(dataDir, `license.key`);
        if (fs.existsSync(licensePath)) {
            try {
                const b64 = fs.readFileSync(licensePath, 'utf8');
                const jsonString = Buffer.from(b64, 'base64').toString('utf8');
                data[col] = JSON.parse(jsonString);
            } catch (err) {
                console.error("LỖI: file license.key không hợp lệ.");
                data[col] = {};
            }
        } else {
            console.error("CẢNH BÁO: Không tìm thấy license.key. Mặc định vô hiệu hóa tính năng cao cấp.");
            data[col] = {};
        }
        return; // Skip normal json loading
    }

    const filePath = path.join(dataDir, `${col}.json`);
    if (fs.existsSync(filePath)) {
        data[col] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
        data[col] = [];
        // Default initial data for some collections if missing
        if (col === 'features') {
            data[col] = {
                ENABLE_TABLE_MANAGEMENT: true,
                ENABLE_SHIFT_MANAGEMENT: true,
                ENABLE_PAYMENT_METHODS: true,
                ENABLE_INVENTORY: true,
                ENABLE_LOYALTY: true,
                ENABLE_PROMOTIONS: true
            };
        } else if (col === 'users') {
            data[col].push({ id: 1, username: 'admin', password: 'admin123', role: 'admin' });
            for (let i = 1; i <= 5; i++) {
                data[col].push({ id: i + 1, username: `user${i}`, password: 'user123', role: 'user' });
            }
        }
        fs.writeFileSync(filePath, JSON.stringify(data[col], null, 2));
    }
});

function saveDB(collectionName) {
    if (collectionName === 'features' && env === 'production') return; // Do not save features to json in PRD

    if (collectionName && data[collectionName]) {
        const filePath = path.join(dataDir, `${collectionName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data[collectionName], null, 2));
    } else {
        // Save all
        collections.forEach(col => {
            if (col === 'features' && env === 'production') return;
            if (data[col] !== undefined) {
                const filePath = path.join(dataDir, `${col}.json`);
                fs.writeFileSync(filePath, JSON.stringify(data[col], null, 2));
            }
        });
    }
}

module.exports = {
    data,
    saveDB
};
