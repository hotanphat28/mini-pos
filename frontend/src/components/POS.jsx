import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, LogOut, Printer, Plus, Minus, Trash2, LayoutDashboard, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = `http://${window.location.hostname}:3001/api`;

function POS({ user, onLogout }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [printerType, setPrinterType] = useState('K80'); // K58 hoặc K80
  const navigate = useNavigate();

  // Modal options state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const catRes = await axios.get(`${API_URL}/categories`);
      const prodRes = await axios.get(`${API_URL}/products`);
      setCategories(catRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu', err);
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
    // Generate a unique ID based on product ID and selected options for the cart
    const optionsHash = options.map(o => o.name).sort().join('|');
    const cartItemId = `${product.id}-${optionsHash}`;

    // Calculate unit price including options
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
        ...product, 
        cartItemId, 
        quantity: 1, 
        price: unitPrice, 
        selected_options: options 
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

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      await axios.post(`${API_URL}/orders`, {
        user_id: user.id, // Báo cáo người bán
        total_amount: totalAmount,
        items: cart,
        printerType
      });
      alert('Thanh toán thành công!');
      setCart([]);
    } catch (err) {
      alert('Lỗi khi thanh toán: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 relative">
      {/* Modal Tùy Chọn */}
      {selectedProduct && (
        <div className="absolute inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg">Tùy chọn: {selectedProduct.name}</h3>
              <button onClick={() => setSelectedProduct(null)} className="hover:bg-blue-700 p-1 rounded transition"><X size={20}/></button>
            </div>
            <div className="p-6">
              <div className="text-gray-600 mb-4">Vui lòng chọn các tùy chọn thêm (có thể chọn nhiều):</div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedProduct.options.map((opt, i) => {
                  const isSelected = selectedOptions.some(o => o.name === opt.name);
                  return (
                    <label key={i} className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition ${isSelected ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleOption(opt)}
                          className="w-5 h-5 text-blue-600"
                        />
                        <span className="font-semibold text-gray-800">{opt.name}</span>
                      </div>
                      <span className="text-blue-600 font-medium">+{opt.price.toLocaleString('vi-VN')}đ</span>
                    </label>
                  );
                })}
              </div>
              <div className="mt-6 pt-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Tạm tính: <strong className="text-lg text-blue-600">{(selectedProduct.price + selectedOptions.reduce((s, o) => s + o.price, 0)).toLocaleString('vi-VN')}đ</strong>
                </div>
                <button 
                  onClick={confirmAddToCart}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md transition"
                >
                  Xong
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cột trái: Danh sách sản phẩm */}
      <div className="flex-1 p-4 flex flex-col h-full overflow-hidden">
        <header className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border mb-4">
          <h1 className="text-xl font-bold text-gray-800">Xin chào, {user.username}</h1>
          <div className="flex items-center gap-4">
            {user.role === 'admin' && (
              <button onClick={() => navigate('/admin')} className="text-blue-600 flex items-center gap-1 hover:text-blue-800 font-semibold bg-blue-50 px-3 py-2 rounded-lg transition">
                <LayoutDashboard size={20} /> Dashboard
              </button>
            )}
            <button onClick={onLogout} className="text-red-500 flex items-center gap-1 hover:text-red-700 bg-red-50 px-3 py-2 rounded-lg transition">
              <LogOut size={20} /> Thoát
            </button>
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
                    <div 
                      key={product.id} 
                      onClick={() => handleProductClick(product)}
                      className="bg-white p-3 rounded-xl shadow-sm cursor-pointer hover:shadow-md hover:border-blue-500 border border-transparent transition-all flex flex-col group relative overflow-hidden"
                    >
                      <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400 overflow-hidden relative">
                        {product.image ? (
                          <img src={`${API_URL.replace('/api', '')}${product.image}`} className="w-full h-full object-cover group-hover:scale-110 transition duration-300"/>
                        ) : (
                          'No Image'
                        )}
                        {product.options && product.options.length > 0 && (
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md">
                            Có tùy chọn
                          </div>
                        )}
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
      <div className="w-full md:w-96 bg-white shadow-xl flex flex-col h-full border-l z-10">
        <div className="p-4 bg-gray-800 text-white flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2"><ShoppingCart size={22}/> Giỏ Hàng</h2>
          <span className="bg-blue-500 px-3 py-1 rounded-full text-sm font-bold shadow-inner">{cart.length} món</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-10 flex flex-col items-center gap-3">
              <ShoppingCart size={48} className="opacity-20"/>
              <p>Chưa có món nào</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartItemId} className="bg-white p-3 rounded-lg shadow-sm border mb-3 relative group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 pr-2">
                    <div className="font-bold text-gray-800 leading-tight">{item.name}</div>
                    {item.selected_options && item.selected_options.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        + {item.selected_options.map(o => o.name).join(', ')}
                      </div>
                    )}
                    <div className="text-sm font-semibold text-blue-600 mt-1">{item.price.toLocaleString('vi-VN')} đ/món</div>
                  </div>
                  <button onClick={() => removeFromCart(item.cartItemId)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition absolute right-2 top-2 opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between border-t pt-2 mt-1">
                  <div className="font-bold text-gray-700">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.cartItemId, -1)} className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 text-gray-600">
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-bold text-gray-800">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartItemId, 1)} className="p-1 bg-white rounded shadow-sm hover:bg-gray-50 text-gray-600">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-white shadow-2xl relative z-20">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-semibold text-sm">Máy in:</span>
            <select 
              value={printerType} 
              onChange={(e) => setPrinterType(e.target.value)}
              className="border p-1.5 rounded-lg text-sm bg-gray-50 focus:ring focus:ring-blue-200 outline-none"
            >
              <option value="K80">Khổ to (K80)</option>
              <option value="K58">Khổ nhỏ (K58)</option>
            </select>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-bold text-gray-800">Tổng cộng:</span>
            <span className="text-3xl font-black text-green-600">{totalAmount.toLocaleString('vi-VN')} đ</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-green-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition transform active:scale-95"
          >
            <Printer size={24} />
            THANH TOÁN & IN BILL
          </button>
        </div>
      </div>
    </div>
  );
}

export default POS;
