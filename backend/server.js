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

// API: Nguyên vật liệu (Materials)
app.get('/api/materials', (req, res) => {
    res.json(db.data.materials || []);
});
app.post('/api/materials', (req, res) => {
    const { name, unit, stock } = req.body;
    const newId = db.data.materials.length > 0 ? Math.max(...db.data.materials.map(m => m.id)) + 1 : 1;
    db.data.materials.push({ id: newId, name, unit, stock: Number(stock) });
    db.saveDB('materials');
    res.json({ success: true });
});
app.put('/api/materials/:id', (req, res) => {
    const id = Number(req.params.id);
    const { name, unit, stock } = req.body;
    const mat = db.data.materials.find(m => m.id === id);
    if (mat) {
        if (name) mat.name = name;
        if (unit) mat.unit = unit;
        if (stock !== undefined) mat.stock = Number(stock);
        db.saveDB('materials');
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Material not found" });
    }
});

// API: Định lượng (Recipes)
app.get('/api/recipes', (req, res) => {
    res.json(db.data.recipes || []);
});
app.post('/api/recipes', (req, res) => {
    const { product_id, ingredients } = req.body;
    db.data.recipes = db.data.recipes.filter(r => r.product_id !== Number(product_id));
    db.data.recipes.push({ product_id: Number(product_id), ingredients });
    db.saveDB('recipes');
    res.json({ success: true });
});

// API: Khách hàng (Customers)
app.get('/api/customers', (req, res) => {
    res.json(db.data.customers || []);
});
app.post('/api/customers', (req, res) => {
    const { phone, name } = req.body;
    const existing = db.data.customers.find(c => c.phone === phone);
    if (existing) return res.status(400).json({ error: "Số điện thoại đã tồn tại" });
    const newId = db.data.customers.length > 0 ? Math.max(...db.data.customers.map(c => c.id)) + 1 : 1;
    const newCustomer = { id: newId, phone, name, points: 0, created_at: new Date().toISOString() };
    db.data.customers.push(newCustomer);
    db.saveDB('customers');
    res.json({ success: true, customer: newCustomer });
});
app.put('/api/customers/:id', (req, res) => {
    const id = Number(req.params.id);
    const { name, phone, points } = req.body;
    const customer = db.data.customers.find(c => c.id === id);
    if (customer) {
        if (name) customer.name = name;
        if (phone) customer.phone = phone;
        if (points !== undefined) customer.points = Number(points);
        db.saveDB('customers');
        res.json({ success: true, customer });
    } else {
        res.status(404).json({ error: "Không tìm thấy khách hàng" });
    }
});

// API: Khuyến mãi (Vouchers)
app.get('/api/vouchers', (req, res) => {
    res.json(db.data.vouchers || []);
});
app.post('/api/vouchers', (req, res) => {
    const { code, type, value, min_order_value } = req.body;
    const newId = db.data.vouchers.length > 0 ? Math.max(...db.data.vouchers.map(v => v.id)) + 1 : 1;
    db.data.vouchers.push({ id: newId, code: code.toUpperCase(), type, value: Number(value), min_order_value: Number(min_order_value), is_active: true });
    db.saveDB('vouchers');
    res.json({ success: true });
});
app.put('/api/vouchers/:id', (req, res) => {
    const id = Number(req.params.id);
    const { is_active } = req.body;
    const voucher = db.data.vouchers.find(v => v.id === id);
    if (voucher) {
        voucher.is_active = is_active;
        db.saveDB('vouchers');
        res.json({ success: true });
    } else {
        res.status(404).json({ error: "Không tìm thấy voucher" });
    }
});

// API: Lấy Feature Flags
app.get('/api/features', (req, res) => {
    try {
        res.json(db.data.features || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Lấy danh sách bàn
app.get('/api/tables', (req, res) => {
    try {
        res.json(db.data.tables || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Thêm bàn
app.post('/api/tables', (req, res) => {
    const { name } = req.body;
    const newId = db.data.tables.length > 0 ? Math.max(...db.data.tables.map(t => t.id)) + 1 : 1;
    db.data.tables.push({ id: newId, name, status: 'available', current_order_id: null });
    db.saveDB('tables');
    res.json({ success: true });
});

// API: Đổi trạng thái bàn
app.put('/api/tables/:id', (req, res) => {
    const id = Number(req.params.id);
    const { status, current_order_id } = req.body;
    const table = db.data.tables.find(t => t.id === id);
    if (table) {
        table.status = status;
        table.current_order_id = current_order_id;
        db.saveDB('tables');
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Table not found' });
    }
});

// API: Ca làm việc hiện tại
app.get('/api/shifts/current', (req, res) => {
    try {
        const currentShift = db.data.shifts.find(s => !s.end_time);
        res.json(currentShift || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Mở ca
app.post('/api/shifts/open', (req, res) => {
    const { start_cash, user_id } = req.body;
    const currentShift = db.data.shifts.find(s => !s.end_time);
    if (currentShift) return res.status(400).json({ error: 'Đã có ca đang mở' });

    const newId = db.data.shifts.length > 0 ? Math.max(...db.data.shifts.map(s => s.id)) + 1 : 1;
    const newShift = {
        id: newId,
        user_id,
        start_time: new Date().toISOString(),
        start_cash: Number(start_cash),
        end_time: null,
        end_cash: null,
        total_revenue: 0,
        cash_revenue: 0,
        transfer_revenue: 0
    };
    db.data.shifts.push(newShift);
    db.saveDB('shifts');
    res.json({ success: true, shift: newShift });
});

// API: Đóng ca
app.post('/api/shifts/close', (req, res) => {
    const { end_cash } = req.body;
    const currentShift = db.data.shifts.find(s => !s.end_time);
    if (!currentShift) return res.status(400).json({ error: 'Không có ca nào đang mở' });

    // Tính toán doanh thu trong ca
    const shiftOrders = db.data.orders.filter(o => o.created_at >= currentShift.start_time);
    
    currentShift.end_time = new Date().toISOString();
    currentShift.end_cash = Number(end_cash);
    currentShift.total_revenue = shiftOrders.reduce((sum, o) => sum + o.total_amount, 0);
    currentShift.cash_revenue = shiftOrders.filter(o => o.payment_method === 'cash').reduce((sum, o) => sum + o.total_amount, 0);
    currentShift.transfer_revenue = shiftOrders.filter(o => o.payment_method === 'transfer').reduce((sum, o) => sum + o.total_amount, 0);

    db.saveDB('shifts');
    res.json({ success: true, shift: currentShift });
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
    const { items, printerType, user_id, payment_method, table_id, customer_id, used_points, voucher_code, subtotal, discount_amount, total_amount } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ error: "Giỏ hàng rỗng" });

    try {
        const orderId = db.data.orders.length > 0 ? db.data.orders[db.data.orders.length - 1].id + 1 : 1;
        
        db.data.orders.push({
            id: orderId,
            user_id: user_id || null,
            table_id: table_id || null,
            customer_id: customer_id || null,
            payment_method: payment_method || 'cash',
            subtotal: subtotal || total_amount,
            discount_amount: discount_amount || 0,
            total_amount: total_amount,
            voucher_code: voucher_code || null,
            used_points: used_points || 0,
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

        db.saveDB('orders');
        db.saveDB('order_items');

        // Khách hàng & Loyalty (Cộng / Trừ điểm)
        if (db.data.features?.ENABLE_LOYALTY && customer_id) {
            const customer = db.data.customers.find(c => c.id === customer_id);
            if (customer) {
                if (used_points) {
                    customer.points -= Number(used_points);
                }
                const earned_points = Math.floor(total_amount / 10000); // 10k = 1 điểm
                customer.points += earned_points;
                db.saveDB('customers');
            }
        }

        // Trừ kho nguyên liệu (Inventory Deduction)
        if (db.data.features?.ENABLE_INVENTORY) {
            items.forEach(item => {
                const recipe = (db.data.recipes || []).find(r => r.product_id === item.id);
                if (recipe && recipe.ingredients) {
                    recipe.ingredients.forEach(ing => {
                        const mat = (db.data.materials || []).find(m => m.id === ing.material_id);
                        if (mat) {
                            mat.stock -= (ing.quantity * item.quantity);
                        }
                    });
                }
            });
            db.saveDB('materials');
        }

        // Nếu đơn hàng gắn với bàn, cập nhật trạng thái bàn thành trống
        if (table_id) {
            const table = db.data.tables.find(t => t.id === table_id);
            if (table) {
                table.status = 'available';
                table.current_order_id = null;
                db.saveDB('tables');
            }
        }

        // --- MÔ PHỎNG IN ẤN THEO YÊU CẦU ---
        // Phân tách Thức uống (Tem dán) và Thức ăn (Phiếu bếp)
        const drinks = [];
        const foods = [];
        items.forEach(item => {
            const product = db.data.products.find(p => p.id === item.id);
            const category = db.data.categories.find(c => c.id === product?.category_id);
            if (category && category.name.toLowerCase().includes('thức ăn')) {
                foods.push(item);
            } else {
                drinks.push(item);
            }
        });

        // 1. In Bill chính tại quầy
        console.log(`[PRINTER] In Bill Thu Ngân cho đơn #${orderId}`);
        // printReceipt(orderId, items, total_amount, printerType);

        // 2. In Tem dán ly cho Thức uống (Mang đi / Tại bàn đều cần tem dán ly)
        drinks.forEach(drink => {
            for(let i=0; i < drink.quantity; i++) {
                console.log(`[PRINTER] In Tem Dán Ly: ${drink.name} ${drink.selected_options.length > 0 ? '(' + drink.selected_options.map(o=>o.name).join(',') + ')' : ''}`);
                // printSticker(drink);
            }
        });

        // 3. In Phiếu Chế Biến (Bếp) cho Thức ăn
        if (foods.length > 0) {
            console.log(`[PRINTER] In Phiếu Chế Biến Bếp cho đơn #${orderId}`);
            foods.forEach(food => {
                console.log(`   - ${food.name} x${food.quantity}`);
            });
            // printKitchenTicket(orderId, foods, table_id);
        }
        // ------------------------------------

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

// Phục vụ file tĩnh của Frontend nếu thư mục public tồn tại (Môi trường PRD)
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
    app.get('*', (req, res, next) => {
        // Bỏ qua các route API
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
            return next();
        }
        res.sendFile(path.join(publicDir, 'index.html'));
    });
}

app.listen(port, () => {
    console.log(`Backend đang chạy tại http://localhost:${port}`);
});
