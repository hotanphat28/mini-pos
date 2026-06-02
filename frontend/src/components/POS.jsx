import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, LogOut, Printer, Plus, Minus, Trash2, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = `http://${window.location.hostname}:3001/api`;

function POS({ user, onLogout }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [printerType, setPrinterType] = useState('K80'); // K58 hoặc K80
  const navigate = useNavigate();

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

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      await axios.post(`${API_URL}/orders`, {
        total_amount: totalAmount,
        items: cart,
        printerType
      });
      alert('Thanh toán và In bill thành công!');
      setCart([]);
    } catch (err) {
      alert('Lỗi khi thanh toán: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Cột trái: Danh sách sản phẩm */}
      <div className="flex-1 p-4 flex flex-col h-full overflow-hidden">
        <header className="flex justify-between items-center bg-white p-4 rounded-lg shadow mb-4">
          <h1 className="text-xl font-bold text-gray-800">Xin chào, {user.username}</h1>
          <div className="flex items-center gap-4">
            {user.role === 'admin' && (
              <button onClick={() => navigate('/admin')} className="text-blue-500 flex items-center gap-1 hover:text-blue-700 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg">
                <LayoutDashboard size={20} /> Dashboard
              </button>
            )}
            <button onClick={onLogout} className="text-red-500 flex items-center gap-1 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg">
              <LogOut size={20} /> Thoát
            </button>
          </div>
        </header>

        <div className="overflow-y-auto flex-1 pr-2">
          {categories.map(cat => (
            <div key={cat.id} className="mb-6">
              <h2 className="text-lg font-bold mb-3 border-b pb-2 text-gray-700">{cat.name}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.filter(p => p.category_id === cat.id).map(product => (
                  <div 
                    key={product.id} 
                    onClick={() => addToCart(product)}
                    className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md hover:border-blue-500 border border-transparent transition-all"
                  >
                    <div className="h-24 bg-gray-200 rounded-md mb-2 flex items-center justify-center text-gray-400">
                      {product.image ? <img src={product.image} className="w-full h-full object-cover rounded-md"/> : 'No Image'}
                    </div>
                    <div className="font-semibold text-gray-800">{product.name}</div>
                    <div className="text-blue-600 font-bold">{product.price.toLocaleString('vi-VN')} đ</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cột phải: Giỏ hàng */}
      <div className="w-full md:w-96 bg-white shadow-lg flex flex-col h-full border-l">
        <div className="p-4 bg-gray-800 text-white flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2"><ShoppingCart /> Giỏ Hàng</h2>
          <span className="bg-blue-500 px-2 py-1 rounded-full text-xs">{cart.length} món</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">Chưa có món nào</div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center mb-4 pb-4 border-b">
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.price.toLocaleString('vi-VN')} đ</div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-gray-200 rounded hover:bg-gray-300">
                    <Minus size={16} />
                  </button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-gray-200 rounded hover:bg-gray-300">
                    <Plus size={16} />
                  </button>
                  <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-500 hover:text-red-700 ml-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600 font-semibold">Máy in:</span>
            <select 
              value={printerType} 
              onChange={(e) => setPrinterType(e.target.value)}
              className="border p-1 rounded"
            >
              <option value="K80">Khổ to (K80)</option>
              <option value="K58">Khổ nhỏ (K58)</option>
            </select>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-bold">Tổng cộng:</span>
            <span className="text-2xl font-bold text-red-600">{totalAmount.toLocaleString('vi-VN')} đ</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-green-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 disabled:opacity-50"
          >
            <Printer size={20} />
            THANH TOÁN & IN BILL
          </button>
        </div>
      </div>
    </div>
  );
}

export default POS;
