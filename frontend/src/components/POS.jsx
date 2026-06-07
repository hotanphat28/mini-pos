import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, LogOut, Printer, Plus, Minus, Trash2, LayoutDashboard, X, Clock, CreditCard, Banknote, QrCode, Search, Gift, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = `http://${window.location.hostname}:3001/api`;

function POS({ user, features, onLogout }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]);
  const [cart, setCart] = useState([]);
  const [printerType, setPrinterType] = useState('K80');
  const navigate = useNavigate();

  // Modal options state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Shift state
  const [currentShift, setCurrentShift] = useState(null);
  const [showOpenShift, setShowOpenShift] = useState(false);
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [startCash, setStartCash] = useState('');
  const [endCash, setEndCash] = useState('');

  // Payment & Table state
  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash, transfer
  const [selectedTable, setSelectedTable] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);

  // Phase 3: Loyalty & Promotions state
  const [customers, setCustomers] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [usePoints, setUsePoints] = useState(false);

  useEffect(() => {
    fetchData();
    if (features?.ENABLE_SHIFT_MANAGEMENT && user.role !== 'admin') {
      checkShift();
    }
  }, [features, user.role]);

  // Handle recalculate voucher if subtotal changes
  useEffect(() => {
    if (appliedVoucher) {
      const currentSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      if (currentSubtotal < appliedVoucher.min_order_value) {
        setAppliedVoucher(null); // auto remove if not eligible anymore
      }
    }
  }, [cart]);

  const fetchData = async () => {
    try {
      const [catRes, prodRes, tableRes, custRes, vouchRes] = await Promise.all([
        axios.get(`${API_URL}/categories`),
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/tables`),
        axios.get(`${API_URL}/customers`).catch(() => ({data: []})),
        axios.get(`${API_URL}/vouchers`).catch(() => ({data: []}))
      ]);
      setCategories(catRes.data);
      setProducts(prodRes.data);
      setTables(tableRes.data);
      setCustomers(custRes.data);
      setVouchers(vouchRes.data);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu', err);
    }
  };

  const checkShift = async () => {
    try {
      const res = await axios.get(`${API_URL}/shifts/current`);
      if (res.data) {
        setCurrentShift(res.data);
      } else {
        setShowOpenShift(true);
      }
    } catch (err) {
      console.error("Lỗi kiểm tra ca:", err);
    }
  };

  const handleOpenShift = async () => {
    if (startCash === '') return alert("Vui lòng nhập tiền đầu ca");
    try {
      const res = await axios.post(`${API_URL}/shifts/open`, { start_cash: startCash, user_id: user.id });
      setCurrentShift(res.data.shift);
      setShowOpenShift(false);
    } catch (err) {
      alert("Lỗi mở ca: " + (err.response?.data?.error || err.message));
    }
  };

  const handleCloseShift = async () => {
    if (endCash === '') return alert("Vui lòng nhập tiền đếm được cuối ca");
    try {
      const res = await axios.post(`${API_URL}/shifts/close`, { end_cash: endCash });
      alert(`Đóng ca thành công!\nTổng doanh thu ca: ${res.data.shift.total_revenue.toLocaleString()}đ`);
      setCurrentShift(null);
      setShowCloseShift(false);
      setShowOpenShift(true);
      setStartCash('');
      setEndCash('');
    } catch (err) {
      alert("Lỗi đóng ca: " + (err.response?.data?.error || err.message));
    }
  };

  const handleProductClick = (product) => {
    if (product.options && product.options.length > 0) {
      setSelectedProduct(product);
      setSelectedOptions([]);
    } else {
      addToCart(product, []);
    }
  };

  const toggleOption = (option) => {
    const isSelected = selectedOptions.some(o => o.name === option.name);
    if (isSelected) {
      setSelectedOptions(selectedOptions.filter(o => o.name !== option.name));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const confirmAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, selectedOptions);
      setSelectedProduct(null);
      setSelectedOptions([]);
    }
  };

  const addToCart = (product, options) => {
    const optionsHash = options.map(o => o.name).sort().join('|');
    const cartItemId = `${product.id}-${optionsHash}`;
    const optionsPrice = options.reduce((sum, opt) => sum + opt.price, 0);
    const unitPrice = product.price + optionsPrice;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.cartItemId === cartItemId);
      if (existingIndex !== -1) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += 1;
        return newCart;
      }
      return [...prev, { 
        ...product, cartItemId, quantity: 1, price: unitPrice, selected_options: options 
      }];
    });
  };

  const updateQuantity = (cartItemId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  // Phase 3 calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  let discountAmount = 0;
  if (appliedVoucher) {
    if (subtotal >= appliedVoucher.min_order_value) {
      if (appliedVoucher.type === 'percent') {
        discountAmount += (subtotal * appliedVoucher.value) / 100;
      } else {
        discountAmount += appliedVoucher.value;
      }
    }
  }

  let pointsDiscount = 0;
  let pointsToDeduct = 0;
  if (usePoints && selectedCustomer && selectedCustomer.points > 0) {
    // 1 point = 1000 VNĐ
    const maxPointsToUse = Math.floor((subtotal - discountAmount) / 1000);
    pointsToDeduct = Math.min(selectedCustomer.points, maxPointsToUse);
    pointsDiscount = pointsToDeduct * 1000;
  }

  discountAmount += pointsDiscount;
  const finalAmount = Math.max(0, subtotal - discountAmount);

  const handleSearchCustomer = () => {
    if (!customerPhone) return;
    const cust = customers.find(c => c.phone === customerPhone);
    if (cust) {
      setSelectedCustomer(cust);
    } else {
      const name = window.prompt("Chưa có khách hàng này. Nhập tên để thêm mới:");
      if (name) {
        axios.post(`${API_URL}/customers`, { phone: customerPhone, name }).then(res => {
          setCustomers([...customers, res.data.customer]);
          setSelectedCustomer(res.data.customer);
        }).catch(err => alert("Lỗi thêm khách hàng"));
      }
    }
  };

  const handleApplyVoucher = () => {
    if (!voucherCode) return;
    const v = vouchers.find(v => v.code === voucherCode.toUpperCase() && v.is_active);
    if (v) {
      if (subtotal >= v.min_order_value) {
        setAppliedVoucher(v);
      } else {
        alert(`Đơn hàng chưa đạt mức tối thiểu (${v.min_order_value.toLocaleString()}đ) để áp dụng voucher này!`);
        setAppliedVoucher(null);
      }
    } else {
      alert("Mã giảm giá không hợp lệ hoặc đã khóa!");
      setAppliedVoucher(null);
    }
  };

  const processCheckout = async () => {
    try {
      await axios.post(`${API_URL}/orders`, {
        user_id: user.id,
        table_id: selectedTable || null,
        customer_id: selectedCustomer ? selectedCustomer.id : null,
        used_points: pointsToDeduct,
        voucher_code: appliedVoucher ? appliedVoucher.code : null,
        subtotal: subtotal,
        discount_amount: discountAmount,
        total_amount: finalAmount,
        items: cart,
        printerType,
        payment_method: paymentMethod
      });
      alert('Thanh toán và In bill thành công!');
      setCart([]);
      setSelectedTable('');
      setShowQRModal(false);
      
      // Reset Phase 3 states
      setCustomerPhone('');
      setSelectedCustomer(null);
      setVoucherCode('');
      setAppliedVoucher(null);
      setUsePoints(false);

      fetchData(); // refresh tables and customer points
    } catch (err) {
      alert('Lỗi khi thanh toán: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    if (features?.ENABLE_PAYMENT_METHODS && paymentMethod === 'transfer') {
      setShowQRModal(true);
    } else {
      processCheckout();
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 relative">
      
      {/* Block Screen: Open Shift */}
      {features?.ENABLE_SHIFT_MANAGEMENT && user.role !== 'admin' && showOpenShift && (
        <div className="absolute inset-0 z-[100] bg-blue-900 bg-opacity-95 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-8 text-center">
            <Clock size={48} className="mx-auto text-blue-500 mb-4"/>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Mở Ca Làm Việc</h2>
            <p className="text-gray-500 text-sm mb-6">Bạn cần khai báo tiền lẻ đầu ca để bắt đầu bán hàng.</p>
            <input 
              type="number" placeholder="Nhập số tiền mặt có trong két (VNĐ)"
              className="w-full border-2 px-4 py-3 rounded-lg text-center font-bold text-lg mb-4 focus:border-blue-500 outline-none"
              value={startCash} onChange={e => setStartCash(e.target.value)}
            />
            <button onClick={handleOpenShift} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-lg">BẮT ĐẦU CA</button>
            <button onClick={onLogout} className="mt-4 text-red-500 text-sm font-semibold hover:underline">Thoát tài khoản</button>
          </div>
        </div>
      )}

      {/* Modal: Close Shift */}
      {showCloseShift && (
        <div className="absolute inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Đóng Ca Làm Việc</h2>
            <p className="text-gray-500 text-sm mb-6">Bạn đang kết thúc ca. Vui lòng đếm tiền mặt thực tế trong két và nhập vào đây để đối soát.</p>
            <input 
              type="number" placeholder="Tiền mặt thực tế đếm được"
              className="w-full border-2 px-4 py-3 rounded-lg text-center font-bold text-lg mb-4 focus:border-red-500 outline-none"
              value={endCash} onChange={e => setEndCash(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={() => setShowCloseShift(false)} className="flex-1 bg-gray-200 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-300">Hủy</button>
              <button onClick={handleCloseShift} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 shadow-lg">ĐÓNG CA</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tùy Chọn */}
      {selectedProduct && (
        <div className="absolute inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">Tùy chọn: {selectedProduct.name}</h3>
              <button onClick={() => setSelectedProduct(null)} className="hover:bg-blue-700 p-1 rounded transition"><X size={20}/></button>
            </div>
            <div className="p-6">
              <div className="text-gray-600 mb-4">Vui lòng chọn các tùy chọn thêm:</div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedProduct.options.map((opt, i) => {
                  const isSelected = selectedOptions.some(o => o.name === opt.name);
                  return (
                    <label key={i} className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition ${isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleOption(opt)} className="w-5 h-5 text-blue-600"/>
                        <span className="font-semibold text-gray-800">{opt.name}</span>
                      </div>
                      <span className="text-blue-600 font-medium">+{opt.price.toLocaleString('vi-VN')}đ</span>
                    </label>
                  );
                })}
              </div>
              <div className="mt-6 pt-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-500">Tạm tính: <strong className="text-lg text-blue-600">{(selectedProduct.price + selectedOptions.reduce((s, o) => s + o.price, 0)).toLocaleString('vi-VN')}đ</strong></div>
                <button onClick={confirmAddToCart} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md">Xong</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Mã QR Chuyển khoản */}
      {showQRModal && (
        <div className="absolute inset-0 z-[60] bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden text-center p-6">
            <h3 className="font-bold text-xl mb-2 flex items-center justify-center gap-2 text-blue-600"><QrCode/> Quét mã thanh toán</h3>
            <p className="text-gray-500 text-sm mb-4">Mã QR động tự động nhập số tiền. Yêu cầu khách quét để thanh toán <strong>{finalAmount.toLocaleString()}đ</strong>.</p>
            <div className="w-48 h-48 mx-auto bg-gray-100 flex items-center justify-center border-4 border-blue-500 rounded-xl mb-6">
              {/* Dummy QR for demo */}
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ChuyenKhoan_${finalAmount}`} alt="QR" className="w-full h-full object-contain p-2"/>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowQRModal(false)} className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded-lg">Hủy</button>
              <button onClick={processCheckout} className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg hover:bg-green-600">Xác nhận đã nhận tiền</button>
            </div>
          </div>
        </div>
      )}

      {/* Cột trái: Danh sách sản phẩm */}
      <div className="flex-1 p-4 flex flex-col h-full overflow-hidden">
        <header className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border mb-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-800">Thu ngân: {user.username}</h1>
            {features?.ENABLE_SHIFT_MANAGEMENT && currentShift && (
              <span className="text-xs text-green-600 font-semibold flex items-center gap-1"><Clock size={12}/> Ca đang mở lúc: {new Date(currentShift.start_time).toLocaleTimeString()}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {features?.ENABLE_SHIFT_MANAGEMENT && user.role !== 'admin' && (
              <button onClick={() => setShowCloseShift(true)} className="text-orange-500 font-semibold bg-orange-50 px-3 py-2 rounded-lg hover:bg-orange-100 flex items-center gap-1 transition">Đóng ca</button>
            )}
            {user.role === 'admin' && (
              <button onClick={() => navigate('/admin')} className="text-blue-600 flex items-center gap-1 hover:bg-blue-100 font-semibold bg-blue-50 px-3 py-2 rounded-lg transition"><LayoutDashboard size={20} /> Dashboard</button>
            )}
            <button onClick={onLogout} className="text-red-500 flex items-center gap-1 hover:bg-red-100 bg-red-50 px-3 py-2 rounded-lg transition"><LogOut size={20} /> Thoát</button>
          </div>
        </header>

        <div className="overflow-y-auto flex-1 pr-2 pb-20 md:pb-0">
          {categories.map(cat => {
            const activeProducts = products.filter(p => p.category_id === cat.id && p.status === 'active');
            if (activeProducts.length === 0) return null;
            return (
              <div key={cat.id} className="mb-6">
                <h2 className="text-lg font-bold mb-3 border-b pb-2 text-gray-700">{cat.name}</h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {activeProducts.map(product => (
                    <div key={product.id} onClick={() => handleProductClick(product)} className="bg-white p-3 rounded-xl shadow-sm cursor-pointer hover:shadow-md border border-transparent hover:border-blue-500 transition-all flex flex-col group relative overflow-hidden">
                      <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400 overflow-hidden relative">
                        {product.image ? <img src={`${API_URL.replace('/api', '')}${product.image}`} className="w-full h-full object-cover group-hover:scale-110 transition duration-300"/> : 'No Image'}
                        {product.options && product.options.length > 0 && <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md">Có tùy chọn</div>}
                      </div>
                      <div className="font-bold text-gray-800 leading-tight mb-1">{product.name}</div>
                      <div className="text-blue-600 font-extrabold mt-auto">{product.price.toLocaleString('vi-VN')} đ</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cột phải: Giỏ hàng */}
      <div className="w-full md:w-[450px] bg-white shadow-xl flex flex-col h-full border-l z-10">
        <div className="p-4 bg-gray-800 text-white flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2"><ShoppingCart size={22}/> Giỏ Hàng</h2>
          <span className="bg-blue-500 px-3 py-1 rounded-full text-sm font-bold shadow-inner">{cart.length} món</span>
        </div>

        {/* Thông tin Khách hàng (Phase 3) */}
        {features?.ENABLE_LOYALTY && (
          <div className="bg-gray-50 border-b p-3">
            {!selectedCustomer ? (
              <div className="flex gap-2">
                <input 
                  type="text" placeholder="SĐT Khách hàng..." 
                  className="flex-1 border px-3 py-1.5 rounded-lg text-sm focus:ring"
                  value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                />
                <button onClick={handleSearchCustomer} className="bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 flex items-center justify-center"><Search size={16}/></button>
              </div>
            ) : (
              <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-2 rounded-lg">
                <div className="flex flex-col">
                  <span className="font-bold text-blue-800 text-sm flex items-center gap-1"><Star size={14} className="fill-orange-400 text-orange-400"/> {selectedCustomer.name}</span>
                  <span className="text-xs text-blue-600">Điểm: {selectedCustomer.points} đ</span>
                </div>
                <button onClick={() => {setSelectedCustomer(null); setUsePoints(false);}} className="text-gray-400 hover:text-red-500 p-1"><X size={16}/></button>
              </div>
            )}
          </div>
        )}

        {/* Danh sách món trong giỏ */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-10 flex flex-col items-center gap-3"><ShoppingCart size={48} className="opacity-20"/><p>Chưa có món nào</p></div>
          ) : (
            cart.map(item => (
              <div key={item.cartItemId} className="bg-white p-3 rounded-lg shadow-sm border mb-3 relative group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 pr-2">
                    <div className="font-bold text-gray-800 leading-tight">{item.name}</div>
                    {item.selected_options && item.selected_options.length > 0 && <div className="text-xs text-gray-500 mt-1">+ {item.selected_options.map(o => o.name).join(', ')}</div>}
                    <div className="text-sm font-semibold text-blue-600 mt-1">{item.price.toLocaleString('vi-VN')} đ/món</div>
                  </div>
                  <button onClick={() => removeFromCart(item.cartItemId)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition absolute right-2 top-2 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                </div>
                <div className="flex items-center justify-between border-t pt-2 mt-1">
                  <div className="font-bold text-gray-700">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</div>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.cartItemId, -1)} className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 text-gray-600"><Minus size={14} /></button>
                    <span className="w-8 text-center font-bold text-gray-800">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartItemId, 1)} className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 text-gray-600"><Plus size={14} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Vouchers & Điểm tích lũy */}
        <div className="px-4 py-3 bg-white border-t border-gray-100">
          {features?.ENABLE_PROMOTIONS && cart.length > 0 && (
            <div className="mb-3">
              {!appliedVoucher ? (
                <div className="flex gap-2">
                  <input 
                    type="text" placeholder="Mã giảm giá..." 
                    className="flex-1 border px-3 py-1.5 rounded-lg text-sm uppercase focus:ring"
                    value={voucherCode} onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                  />
                  <button onClick={handleApplyVoucher} className="bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 font-semibold text-sm">Áp dụng</button>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-green-50 border border-green-200 p-2 rounded-lg text-sm">
                  <span className="text-green-700 font-bold flex items-center gap-1"><Gift size={16}/> Đã áp dụng: {appliedVoucher.code}</span>
                  <button onClick={() => setAppliedVoucher(null)} className="text-red-400 hover:text-red-600 p-1"><X size={16}/></button>
                </div>
              )}
            </div>
          )}

          {features?.ENABLE_LOYALTY && selectedCustomer && selectedCustomer.points > 0 && (
            <label className="flex items-center gap-2 text-sm text-gray-700 bg-orange-50 p-2 rounded-lg border border-orange-100 cursor-pointer">
              <input type="checkbox" checked={usePoints} onChange={() => setUsePoints(!usePoints)} className="w-4 h-4 text-orange-500 focus:ring-orange-500 rounded"/>
              <span>Quy đổi điểm giảm trực tiếp (Tối đa: <strong>{Math.min(selectedCustomer.points, Math.floor((subtotal - discountAmount + pointsDiscount)/1000)).toLocaleString()}đ</strong>)</span>
            </label>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 shadow-2xl relative z-20">
          {/* Tóm tắt thanh toán */}
          <div className="space-y-1 mb-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span className="font-semibold">{subtotal.toLocaleString()}đ</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá:</span>
                <span className="font-semibold">-{discountAmount.toLocaleString()}đ</span>
              </div>
            )}
          </div>

          {features?.ENABLE_PAYMENT_METHODS && (
            <div className="mb-4">
              <span className="text-gray-600 font-semibold text-sm mb-2 block">Hình thức thanh toán:</span>
              <div className="flex gap-2">
                <button onClick={() => setPaymentMethod('cash')} className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 border-2 transition ${paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}><Banknote size={18}/> Tiền mặt</button>
                <button onClick={() => setPaymentMethod('transfer')} className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-2 border-2 transition ${paymentMethod === 'transfer' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}><CreditCard size={18}/> Chuyển khoản</button>
              </div>
            </div>
          )}

          {features?.ENABLE_TABLE_MANAGEMENT && tables.length > 0 && (
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-semibold text-sm">Gắn với Bàn:</span>
              <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} className="border p-1.5 rounded-lg text-sm bg-gray-50 focus:ring focus:ring-blue-200 outline-none">
                <option value="">-- Mua mang đi (Takeaway) --</option>
                {tables.map(t => (
                  <option key={t.id} value={t.id}>{t.name} {t.status !== 'available' ? '(Đang có khách)' : ''}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-semibold text-sm">Máy in:</span>
            <select value={printerType} onChange={(e) => setPrinterType(e.target.value)} className="border p-1.5 rounded-lg text-sm bg-gray-50 focus:ring focus:ring-blue-200 outline-none">
              <option value="K80">Khổ to (K80)</option>
              <option value="K58">Khổ nhỏ (K58)</option>
            </select>
          </div>
          
          <div className="flex justify-between items-center mb-6 pt-3 border-t">
            <span className="text-xl font-bold text-gray-800">Thành tiền:</span>
            <span className="text-3xl font-black text-blue-600">{finalAmount.toLocaleString('vi-VN')} đ</span>
          </div>
          <button 
            onClick={handleCheckoutClick}
            disabled={cart.length === 0}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition transform active:scale-95"
          >
            <Printer size={24} /> THANH TOÁN & IN BILL
          </button>

          {features?.ENABLE_LOYALTY && selectedCustomer && cart.length > 0 && (
            <div className="text-center text-xs text-gray-500 mt-3">
              Sau khi thanh toán, khách hàng sẽ nhận được <strong>{Math.floor(finalAmount / 10000)}</strong> điểm tích lũy.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default POS;
