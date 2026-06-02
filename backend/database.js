const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'pos_db.json');

let data = {
    users: [],
    categories: [],
    products: [],
    orders: [],
    order_items: []
};

// Khởi tạo DB nếu chưa có
if (fs.existsSync(dbPath)) {
    data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
} else {
    data.users.push({ id: 1, username: 'admin', password: 'admin123', role: 'admin' });
    for (let i = 1; i <= 5; i++) {
        data.users.push({ id: i + 1, username: `user${i}`, password: 'user123', role: 'user' });
    }
    
    data.categories.push({ id: 1, name: 'Cà Phê' });
    data.categories.push({ id: 2, name: 'Trà Sữa' });
    
    data.products.push({ id: 1, category_id: 1, name: 'Cà Phê Đen', price: 15000 });
    data.products.push({ id: 2, category_id: 1, name: 'Cà Phê Sữa', price: 20000 });
    data.products.push({ id: 3, category_id: 2, name: 'Trà Sữa Trân Châu', price: 25000 });
    
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function saveDB() {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = {
    data,
    saveDB
};
