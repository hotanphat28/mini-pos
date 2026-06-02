import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, TrendingUp, Package, Tag, Edit2, CheckCircle, XCircle, Image as ImageIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = `http://${window.location.hostname}:3001/api`;

function Admin({ user, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reports'); // reports, menu
  
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const initialProductState = { id: null, name: '', price: '', category_id: '', image: '', status: 'active', options: [] };
  const [editingProduct, setEditingProduct] = useState(initialProductState);
  const [isEditing, setIsEditing] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  
  // Option state for Food
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionPrice, setNewOptionPrice] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [ordRes, catRes, prodRes] = await Promise.all([
      axios.get(`${API_URL}/reports/orders`),
      axios.get(`${API_URL}/categories`),
      axios.get(`${API_URL}/products`)
    ]);
    setOrders(ordRes.data);
    setCategories(catRes.data);
    setProducts(prodRes.data);
    
    if (catRes.data.length > 0 && !editingProduct.category_id && !isEditing) {
        setEditingProduct(prev => ({...prev, category_id: catRes.data[0].id}));
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return editingProduct.image;
    const formData = new FormData();
    formData.append('image', imageFile);
    try {
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.url;
    } catch (err) {
      console.error("Upload error:", err);
      alert("Lỗi upload ảnh");
      return editingProduct.image;
    }
  };

  const handleAddOption = () => {
    if (!newOptionName || !newOptionPrice) return;
    setEditingProduct(prev => ({
      ...prev,
      options: [...prev.options, { name: newOptionName, price: Number(newOptionPrice) }]
    }));
    setNewOptionName('');
    setNewOptionPrice('');
  };

  const handleRemoveOption = (index) => {
    setEditingProduct(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct.name || !editingProduct.price) return;
    
    const imageUrl = await uploadImage();
    const productData = { ...editingProduct, image: imageUrl };

    if (isEditing) {
      await axios.put(`${API_URL}/products/${editingProduct.id}`, productData);
    } else {
      await axios.post(`${API_URL}/products`, productData);
    }
    
    resetForm();
    fetchData();
  };

  const handleEditClick = (prod) => {
    setIsEditing(true);
    setEditingProduct({
      id: prod.id,
      name: prod.name,
      price: prod.price,
      category_id: prod.category_id,
      image: prod.image || '',
      status: prod.status || 'active',
      options: prod.options || []
    });
    setImageFile(null);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Bạn muốn xóa món này?")) return;
    await axios.delete(`${API_URL}/products/${id}`);
    fetchData();
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingProduct({ ...initialProductState, category_id: categories.length > 0 ? categories[0].id : '' });
    setImageFile(null);
    setNewOptionName('');
    setNewOptionPrice('');
  };

  // Determine if selected category is "Thức ăn" (id = 2 typically, but we check name just in case)
  const isFoodCategory = () => {
    const cat = categories.find(c => c.id === Number(editingProduct.category_id));
    return cat && cat.name.toLowerCase().includes('thức ăn');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="text-blue-500" /> Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Quản lý doanh thu và thực đơn</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/pos')} className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 font-semibold text-gray-700">
              <ArrowLeft size={18} /> Về Màn hình Thu ngân
            </button>
          </div>
        </header>

        <div className="flex gap-6 mb-6 border-b pb-4">
          <button onClick={() => setActiveTab('reports')} className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'reports' ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
            Báo cáo chi tiết đơn hàng
          </button>
          <button onClick={() => setActiveTab('menu')} className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'menu' ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
            Quản lý Thực đơn
          </button>
        </div>

        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4">Danh sách đơn hàng bán ra</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-600">
                    <th className="p-4 rounded-tl-lg">Mã Đơn</th>
                    <th className="p-4">Thời gian</th>
                    <th className="p-4">Người bán</th>
                    <th className="p-4">Số lượng món</th>
                    <th className="p-4">Tổng tiền</th>
                    <th className="p-4 rounded-tr-lg">Chi tiết (Hover)</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t hover:bg-gray-50 group transition">
                      <td className="p-4 font-semibold text-blue-600">#{order.id}</td>
                      <td className="p-4">{new Date(order.created_at).toLocaleString('vi-VN')}</td>
                      <td className="p-4 font-medium">{order.username}</td>
                      <td className="p-4">{order.total_quantity} món</td>
                      <td className="p-4 text-green-600 font-bold">{order.total_amount.toLocaleString('vi-VN')} đ</td>
                      <td className="p-4 relative">
                        <span className="text-gray-500 text-sm underline cursor-help">Xem chi tiết</span>
                        <div className="hidden group-hover:block absolute right-0 z-10 w-72 bg-white border shadow-xl rounded-lg p-4 mt-2">
                          <h4 className="font-bold border-b pb-2 mb-2">Chi tiết đơn #{order.id}</h4>
                          <ul className="space-y-2 max-h-48 overflow-y-auto">
                            {order.items.map(item => (
                              <li key={item.id} className="text-sm">
                                <div className="flex justify-between font-semibold">
                                  <span>{item.product_name} x{item.quantity}</span>
                                  <span>{(item.price * item.quantity).toLocaleString()}đ</span>
                                </div>
                                {item.selected_options && item.selected_options.length > 0 && (
                                  <div className="text-xs text-gray-500 ml-2">
                                    + {item.selected_options.map(opt => `${opt.name}`).join(', ')}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan="6" className="p-4 text-center text-gray-500">Chưa có dữ liệu bán hàng</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Thêm/Sửa Sản phẩm */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Package size={20}/> {isEditing ? 'Sửa món' : 'Thêm món mới'}
              </h2>
              
              <form onSubmit={handleSubmitProduct} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Danh mục</label>
                  <select 
                    className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-200" required
                    value={editingProduct.category_id} 
                    onChange={e => setEditingProduct({...editingProduct, category_id: e.target.value})}
                  >
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tên món</label>
                  <input 
                    type="text" placeholder="Nhập tên món..." required
                    className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-200"
                    value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Giá cơ bản (VNĐ)</label>
                  <input 
                    type="number" placeholder="Ví dụ: 25000" required
                    className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-200"
                    value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ảnh minh họa</label>
                  <input 
                    type="file" accept="image/*"
                    onChange={handleImageChange}
                    className="w-full border px-3 py-2 rounded text-sm bg-gray-50"
                  />
                  {editingProduct.image && !imageFile && (
                    <div className="mt-2 text-sm text-gray-500">
                      Ảnh hiện tại: <img src={`${API_URL.replace('/api', '')}${editingProduct.image}`} alt="Current" className="w-16 h-16 object-cover rounded mt-1" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border p-3 rounded bg-gray-50">
                  <span className="text-sm font-semibold text-gray-700">Trạng thái bán</span>
                  <button 
                    type="button" 
                    onClick={() => setEditingProduct({...editingProduct, status: editingProduct.status === 'active' ? 'inactive' : 'active'})}
                    className={`px-3 py-1 rounded-full text-sm font-bold transition flex items-center gap-1 ${editingProduct.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  >
                    {editingProduct.status === 'active' ? <CheckCircle size={16}/> : <XCircle size={16}/>}
                    {editingProduct.status === 'active' ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {isFoodCategory() && (
                  <div className="border p-4 rounded bg-orange-50 border-orange-100">
                    <h3 className="font-bold text-orange-800 text-sm mb-3">Tùy chọn cho thức ăn</h3>
                    
                    <ul className="mb-3 space-y-2">
                      {editingProduct.options.map((opt, i) => (
                        <li key={i} className="flex justify-between items-center bg-white p-2 border rounded text-sm">
                          <span>{opt.name} <span className="text-gray-500">(+{opt.price.toLocaleString()}đ)</span></span>
                          <button type="button" onClick={() => handleRemoveOption(i)} className="text-red-500 p-1 hover:bg-red-50 rounded"><X size={14}/></button>
                        </li>
                      ))}
                    </ul>

                    <div className="flex gap-2">
                      <input 
                        type="text" placeholder="Tên tùy chọn" 
                        className="flex-1 min-w-0 border px-2 py-1 rounded text-sm"
                        value={newOptionName} onChange={e => setNewOptionName(e.target.value)}
                      />
                      <input 
                        type="number" placeholder="Giá" 
                        className="w-20 border px-2 py-1 rounded text-sm"
                        value={newOptionPrice} onChange={e => setNewOptionPrice(e.target.value)}
                      />
                      <button type="button" onClick={handleAddOption} className="bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600"><Plus size={16}/></button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 shadow-md">
                    {isEditing ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                  {isEditing && (
                    <button type="button" onClick={resetForm} className="px-4 bg-gray-200 text-gray-700 font-bold py-2 rounded hover:bg-gray-300">
                      Hủy
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Danh sách Sản phẩm */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Tag size={20}/> Danh sách thực đơn</h2>
              
              <div className="space-y-6">
                {categories.map(cat => (
                  <div key={cat.id}>
                    <h3 className="font-bold text-lg text-gray-700 border-b pb-2 mb-3">{cat.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {products.filter(p => p.category_id === cat.id).map(prod => (
                        <div key={prod.id} className={`flex items-center gap-4 bg-white p-3 rounded-lg border shadow-sm ${prod.status === 'inactive' ? 'opacity-50' : ''}`}>
                          <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center text-gray-400">
                            {prod.image ? <img src={`${API_URL.replace('/api', '')}${prod.image}`} className="w-full h-full object-cover"/> : <ImageIcon size={24}/>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-800 truncate">{prod.name} {prod.status === 'inactive' && <span className="text-xs text-red-500 ml-1">(Đã tắt)</span>}</div>
                            <div className="text-sm text-green-600 font-semibold">{prod.price.toLocaleString('vi-VN')} đ</div>
                            {prod.options && prod.options.length > 0 && (
                              <div className="text-xs text-gray-500 mt-1 truncate">
                                + {prod.options.length} tùy chọn
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <button onClick={() => handleEditClick(prod)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded transition"><Edit2 size={16}/></button>
                            <button onClick={() => handleDeleteProduct(prod.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition"><Trash2 size={16}/></button>
                          </div>
                        </div>
                      ))}
                      {products.filter(p => p.category_id === cat.id).length === 0 && (
                        <div className="text-gray-400 text-sm italic col-span-2">Chưa có món nào.</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
