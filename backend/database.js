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
    if (collectionName && data[collectionName]) {
        const filePath = path.join(dataDir, `${collectionName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data[collectionName], null, 2));
    } else {
        // Save all
        collections.forEach(col => {
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
