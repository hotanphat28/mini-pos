const express = require('express');
const cors = require('cors');
const db = require('./database');
const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Configure multer
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });
app.use('/uploads', express.static(uploadDir));

// API: Upload image
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ url: `/uploads/${req.file.filename}` });
});

// API: Lấy danh sách danh mục
app.get('/api/categories', (req, res) => {
    try {
        res.json(db.data.categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Lấy danh sách sản phẩm
app.get('/api/products', (req, res) => {
    try {
        res.json(db.data.products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Thêm danh mục
app.post('/api/categories', (req, res) => {
    const { name } = req.body;
    const newId = db.data.categories.length > 0 ? Math.max(...db.data.categories.map(c => c.id)) + 1 : 1;
    db.data.categories.push({ id: newId, name });
    db.saveDB();
    res.json({ success: true });
});

// API: Xóa danh mục
app.delete('/api/categories/:id', (req, res) => {
    const id = Number(req.params.id);
    db.data.categories = db.data.categories.filter(c => c.id !== id);
    db.data.products = db.data.products.filter(p => p.category_id !== id);
    db.saveDB();
    res.json({ success: true });
});

// API: Thêm sản phẩm
app.post('/api/products', (req, res) => {
    const { category_id, name, price, image, status, options } = req.body;
    const newId = db.data.products.length > 0 ? Math.max(...db.data.products.map(p => p.id)) + 1 : 1;
    db.data.products.push({ id: newId, category_id: Number(category_id), name, price: Number(price), image: image || '', status: status || 'active', options: options || [] });
    db.saveDB();
    res.json({ success: true });
});

// API: Cập nhật sản phẩm
app.put('/api/products/:id', (req, res) => {
    const id = Number(req.params.id);
    const { category_id, name, price, image, status, options } = req.body;
    const index = db.data.products.findIndex(p => p.id === id);
    if (index !== -1) {
        db.data.products[index] = { ...db.data.products[index], category_id: Number(category_id), name, price: Number(price), image, status, options };
        db.saveDB();
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Product not found" });
    }
});

// API: Xóa sản phẩm
app.delete('/api/products/:id', (req, res) => {
    const id = Number(req.params.id);
    db.data.products = db.data.products.filter(p => p.id !== id);
    db.saveDB();
    res.json({ success: true });
});

// API: Đăng nhập
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    try {
        const user = db.data.users.find(u => u.username === username && u.password === password);
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Tạo đơn hàng & In bill
app.post('/api/orders', async (req, res) => {
    const { total_amount, items, printerType, user_id } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ error: "Giỏ hàng rỗng" });

    try {
        const orderId = db.data.orders.length > 0 ? db.data.orders[db.data.orders.length - 1].id + 1 : 1;
        
        db.data.orders.push({
            id: orderId,
            user_id: user_id || null,
            total_amount,
            created_at: new Date().toISOString()
        });

        items.forEach(item => {
            const itemId = db.data.order_items.length > 0 ? db.data.order_items[db.data.order_items.length - 1].id + 1 : 1;
            db.data.order_items.push({
                id: itemId,
                order_id: orderId,
                product_id: item.id,
                quantity: item.quantity,
                price: item.price,
                selected_options: item.selected_options || []
            });
        });

        db.saveDB();

        // Mô phỏng quá trình in bill
        // printReceipt(orderId, items, total_amount, printerType);

        res.json({ success: true, orderId, message: "Tạo đơn hàng thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Hàm mô phỏng in bill
async function printReceipt(orderId, items, total, type) {
    const charWidth = type === 'K58' ? 32 : 48;
    
    let printer = new ThermalPrinter({
        type: type === 'K58' ? PrinterTypes.EPSON : PrinterTypes.EPSON,
        interface: 'printer:My_Printer', 
        width: charWidth,
        characterSet: 'WPC1258_VIETNAMESE'
    });

    printer.alignCenter();
    printer.println("MINI POS CAFE");
    printer.println("123 Duong ABC, Quan XYZ");
    printer.drawLine();
    
    printer.alignLeft();
    printer.println(`Ma don hang: #${orderId}`);
    printer.println(`Ngay: ${new Date().toLocaleString('vi-VN')}`);
    printer.drawLine();
    
    items.forEach(item => {
        printer.tableCustom([
            { text: `${item.name} x${item.quantity}`, align: "LEFT", width: 0.6 },
            { text: `${(item.price * item.quantity).toLocaleString()} d`, align: "RIGHT", width: 0.4 }
        ]);
    });
    
    printer.drawLine();
    printer.tableCustom([
        { text: "TONG CONG:", align: "LEFT", width: 0.5 },
        { text: `${total.toLocaleString()} d`, align: "RIGHT", width: 0.5 }
    ]);
    
    printer.alignCenter();
    printer.println("Cam on & Hen gap lai!");
    printer.cut();

    try {
        let execute = printer.execute();
        console.log("Print done!");
    } catch (error) {
        console.error("Print failed:", error);
    }
}

// API: Báo cáo tổng quan (Dành cho Admin)
app.get('/api/reports/daily', (req, res) => {
    try {
        const report = {};
        db.data.orders.forEach(order => {
            const date = order.created_at.split('T')[0];
            if (!report[date]) {
                report[date] = { date, revenue: 0, total_orders: 0 };
            }
            report[date].revenue += order.total_amount;
            report[date].total_orders += 1;
        });
        const result = Object.values(report).sort((a, b) => b.date.localeCompare(a.date));
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Báo cáo chi tiết đơn hàng
app.get('/api/reports/orders', (req, res) => {
    try {
        const ordersWithDetails = db.data.orders.map(order => {
            const user = db.data.users.find(u => u.id === order.user_id) || { username: 'Unknown' };
            const items = db.data.order_items.filter(oi => oi.order_id === order.id).map(oi => {
                const product = db.data.products.find(p => p.id === oi.product_id) || { name: 'Unknown' };
                return {
                    ...oi,
                    product_name: product.name
                };
            });
            const total_quantity = items.reduce((sum, item) => sum + item.quantity, 0);
            return {
                ...order,
                username: user.username,
                items,
                total_quantity
            };
        }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json(ordersWithDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Backend đang chạy tại http://localhost:${port}`);
});
