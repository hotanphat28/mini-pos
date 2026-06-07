import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, TrendingUp, Package, Tag, Edit2, CheckCircle, XCircle, Image as ImageIcon, X, Archive, Database, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = `http://${window.location.hostname}:3001/api`;

function Admin({ user, features, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reports'); // reports, menu, inventory
  
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Phase 3 State
  const [customers, setCustomers] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [editingCustomer, setEditingCustomer] = useState({ id: null, phone: '', name: '', points: 0 });
  const [editingVoucher, setEditingVoucher] = useState({ id: null, code: '', type: 'percent', value: '', min_order_value: '' });
  
  // Inventory State
  const [materials, setMaterials] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [editingMaterial, setEditingMaterial] = useState({ id: null, name: '', unit: '', stock: '' });
  const [selectedProductForRecipe, setSelectedProductForRecipe] = useState('');
  const [currentRecipe, setCurrentRecipe] = useState([]);
  const [newIngredient, setNewIngredient] = useState({ material_id: '', quantity: '' });

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
    try {
      const [ordRes, catRes, prodRes, matRes, recRes, custRes, vouchRes] = await Promise.all([
        axios.get(`${API_URL}/reports/orders`),
        axios.get(`${API_URL}/categories`),
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/materials`),
        axios.get(`${API_URL}/recipes`),
        axios.get(`${API_URL}/customers`),
        axios.get(`${API_URL}/vouchers`)
      ]);
      setOrders(ordRes.data);
      setCategories(catRes.data);
      setProducts(prodRes.data);
      setMaterials(matRes.data);
      setRecipes(recRes.data);
      setCustomers(custRes.data);
      setVouchers(vouchRes.data);
      
      if (catRes.data.length > 0 && !editingProduct.category_id && !isEditing) {
          setEditingProduct(prev => ({...prev, category_id: catRes.data[0].id}));
      }
    } catch(err) {
      console.error("Lỗi fetch data Admin:", err);
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

  const isFoodCategory = () => {
    const cat = categories.find(c => c.id === Number(editingProduct.category_id));
    return cat && cat.name.toLowerCase().includes('thức ăn');
  };

  // ---- PHASE 3 LOGIC ----
  const handleSubmitCustomer = async (e) => {
    e.preventDefault();
    if (!editingCustomer.phone || !editingCustomer.name) return;
    try {
      if (editingCustomer.id) {
        await axios.put(`${API_URL}/customers/${editingCustomer.id}`, editingCustomer);
      } else {
        await axios.post(`${API_URL}/customers`, editingCustomer);
      }
      setEditingCustomer({ id: null, phone: '', name: '', points: 0 });
      fetchData();
    } catch(err) {
      alert(err.response?.data?.error || "Lỗi lưu khách hàng");
    }
  };

  const handleSubmitVoucher = async (e) => {
    e.preventDefault();
    if (!editingVoucher.code || !editingVoucher.value) return;
    try {
      await axios.post(`${API_URL}/vouchers`, editingVoucher);
      setEditingVoucher({ id: null, code: '', type: 'percent', value: '', min_order_value: '' });
      fetchData();
    } catch(err) {
      alert("Lỗi lưu voucher");
    }
  };

  const toggleVoucherActive = async (v) => {
    await axios.put(`${API_URL}/vouchers/${v.id}`, { is_active: !v.is_active });
    fetchData();
  };

  // ---- INVENTORY LOGIC ----
  const handleSubmitMaterial = async (e) => {
    e.preventDefault();
    if (!editingMaterial.name || !editingMaterial.unit || editingMaterial.stock === '') return;
    if (editingMaterial.id) {
      await axios.put(`${API_URL}/materials/${editingMaterial.id}`, editingMaterial);
    } else {
      await axios.post(`${API_URL}/materials`, editingMaterial);
    }
    setEditingMaterial({ id: null, name: '', unit: '', stock: '' });
    fetchData();
  };

  const handleSelectProductForRecipe = (productId) => {
    setSelectedProductForRecipe(productId);
    const existingRecipe = recipes.find(r => r.product_id === Number(productId));
    if (existingRecipe) {
      setCurrentRecipe(existingRecipe.ingredients);
    } else {
      setCurrentRecipe([]);
    }
  };

  const handleAddIngredient = () => {
    if (!newIngredient.material_id || !newIngredient.quantity) return;
    setCurrentRecipe([...currentRecipe, { 
      material_id: Number(newIngredient.material_id), 
      quantity: Number(newIngredient.quantity) 
    }]);
    setNewIngredient({ material_id: '', quantity: '' });
  };

  const handleRemoveIngredient = (index) => {
    setCurrentRecipe(currentRecipe.filter((_, i) => i !== index));
  };

  const handleSaveRecipe = async () => {
    if (!selectedProductForRecipe) return;
    await axios.post(`${API_URL}/recipes`, { 
      product_id: selectedProductForRecipe, 
      ingredients: currentRecipe 
    });
    alert("Lưu định lượng thành công!");
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="text-blue-500" /> Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Quản lý doanh thu, thực đơn {features?.ENABLE_INVENTORY ? 'và kho hàng' : ''}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/pos')} className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 font-semibold text-gray-700">
              <ArrowLeft size={18} /> Về Màn hình Thu ngân
            </button>
          </div>
        </header>

        <div className="flex gap-4 mb-6 border-b pb-4 overflow-x-auto">
          <button onClick={() => setActiveTab('reports')} className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${activeTab === 'reports' ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
            Báo cáo chi tiết đơn hàng
          </button>
          <button onClick={() => setActiveTab('menu')} className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${activeTab === 'menu' ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
            Quản lý Thực đơn
          </button>
          {features?.ENABLE_INVENTORY && (
            <button onClick={() => setActiveTab('inventory')} className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${activeTab === 'inventory' ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
              Quản lý Kho
            </button>
          )}
          {features?.ENABLE_LOYALTY && (
            <button onClick={() => setActiveTab('customers')} className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${activeTab === 'customers' ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
              Khách hàng
            </button>
          )}
          {features?.ENABLE_PROMOTIONS && (
            <button onClick={() => setActiveTab('vouchers')} className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${activeTab === 'vouchers' ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
              Khuyến mãi (Voucher)
            </button>
          )}
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
                            {order.items.map((item, idx) => (
                              <li key={idx} className="text-sm">
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

        {activeTab === 'inventory' && features?.ENABLE_INVENTORY && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cột 1: Danh sách & Nạp Nguyên vật liệu */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Database size={20}/> Danh sách Nguyên Vật Liệu</h2>
              <form onSubmit={handleSubmitMaterial} className="flex gap-2 mb-6 bg-gray-50 p-3 rounded-lg border">
                <input 
                  type="text" placeholder="Tên NVL (VD: Đường)" required
                  className="flex-1 border px-2 py-2 rounded text-sm"
                  value={editingMaterial.name} onChange={e => setEditingMaterial({...editingMaterial, name: e.target.value})}
                />
                <input 
                  type="text" placeholder="Đơn vị (g, ml...)" required
                  className="w-24 border px-2 py-2 rounded text-sm"
                  value={editingMaterial.unit} onChange={e => setEditingMaterial({...editingMaterial, unit: e.target.value})}
                />
                <input 
                  type="number" placeholder="Tồn kho" required
                  className="w-28 border px-2 py-2 rounded text-sm"
                  value={editingMaterial.stock} onChange={e => setEditingMaterial({...editingMaterial, stock: e.target.value})}
                />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold">Lưu</button>
              </form>

              <div className="overflow-y-auto max-h-96">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 rounded-tl">Tên NVL</th>
                      <th className="p-2">Đơn vị</th>
                      <th className="p-2">Tồn kho</th>
                      <th className="p-2 rounded-tr text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map(mat => (
                      <tr key={mat.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-semibold text-gray-700">{mat.name}</td>
                        <td className="p-2 text-gray-500">{mat.unit}</td>
                        <td className={`p-2 font-bold ${mat.stock < 100 ? 'text-red-500' : 'text-green-600'}`}>{mat.stock.toLocaleString()}</td>
                        <td className="p-2 text-center">
                          <button onClick={() => setEditingMaterial(mat)} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Edit2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                    {materials.length === 0 && <tr><td colSpan="4" className="text-center p-4 text-gray-400">Chưa có nguyên vật liệu</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cột 2: Thiết lập Định lượng (Recipes) */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Archive size={20}/> Thiết lập Định lượng (Recipe)</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Chọn món để cài đặt công thức:</label>
                <select 
                  className="w-full border px-3 py-2 rounded focus:ring focus:ring-blue-200"
                  value={selectedProductForRecipe}
                  onChange={(e) => handleSelectProductForRecipe(e.target.value)}
                >
                  <option value="">-- Chọn món --</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {selectedProductForRecipe && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-bold text-blue-800 mb-3">Thành phần cấu tạo món:</h3>
                  <ul className="mb-4 space-y-2">
                    {currentRecipe.map((ing, i) => {
                      const mat = materials.find(m => m.id === ing.material_id);
                      return (
                        <li key={i} className="flex justify-between items-center bg-white p-2 border rounded shadow-sm">
                          <span className="font-semibold text-gray-700">{mat ? mat.name : 'Unknown'}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-blue-600 font-bold">{ing.quantity} {mat?.unit}</span>
                            <button onClick={() => handleRemoveIngredient(i)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={16}/></button>
                          </div>
                        </li>
                      );
                    })}
                    {currentRecipe.length === 0 && <div className="text-sm text-gray-500 italic">Món này chưa thiết lập nguyên liệu.</div>}
                  </ul>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-blue-200">
                    <select 
                      className="flex-1 border px-2 py-2 rounded text-sm"
                      value={newIngredient.material_id} onChange={e => setNewIngredient({...newIngredient, material_id: e.target.value})}
                    >
                      <option value="">-- Chọn NVL --</option>
                      {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                    </select>
                    <input 
                      type="number" placeholder="Số lượng" 
                      className="w-24 border px-2 py-2 rounded text-sm"
                      value={newIngredient.quantity} onChange={e => setNewIngredient({...newIngredient, quantity: e.target.value})}
                    />
                    <button onClick={handleAddIngredient} className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"><Plus size={18}/></button>
                  </div>

                  <button 
                    onClick={handleSaveRecipe}
                    className="w-full mt-4 bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2 shadow-md"
                  >
                    <Save size={18}/> LƯU CÔNG THỨC
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'customers' && features?.ENABLE_LOYALTY && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4">Danh sách Khách hàng thân thiết</h2>
            <form onSubmit={handleSubmitCustomer} className="flex gap-2 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <input 
                type="text" placeholder="Số điện thoại" required
                className="w-48 border px-3 py-2 rounded focus:ring"
                value={editingCustomer.phone} onChange={e => setEditingCustomer({...editingCustomer, phone: e.target.value})}
              />
              <input 
                type="text" placeholder="Tên khách hàng" required
                className="flex-1 border px-3 py-2 rounded focus:ring"
                value={editingCustomer.name} onChange={e => setEditingCustomer({...editingCustomer, name: e.target.value})}
              />
              {editingCustomer.id && (
                <input 
                  type="number" placeholder="Điểm" required
                  className="w-24 border px-3 py-2 rounded focus:ring"
                  value={editingCustomer.points} onChange={e => setEditingCustomer({...editingCustomer, points: e.target.value})}
                />
              )}
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold">
                {editingCustomer.id ? 'Cập nhật' : 'Thêm mới'}
              </button>
              {editingCustomer.id && (
                <button type="button" onClick={() => setEditingCustomer({ id: null, phone: '', name: '', points: 0 })} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">Hủy</button>
              )}
            </form>

            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border-b">Số điện thoại</th>
                  <th className="p-3 border-b">Tên khách hàng</th>
                  <th className="p-3 border-b">Điểm tích lũy</th>
                  <th className="p-3 border-b text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 border-b">
                    <td className="p-3 font-semibold text-gray-700">{c.phone}</td>
                    <td className="p-3">{c.name}</td>
                    <td className="p-3 font-bold text-orange-500">{c.points} đ</td>
                    <td className="p-3 text-center">
                      <button onClick={() => setEditingCustomer(c)} className="text-blue-500 hover:bg-blue-100 p-1.5 rounded"><Edit2 size={16}/></button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && <tr><td colSpan="4" className="text-center p-4 text-gray-400">Chưa có khách hàng</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'vouchers' && features?.ENABLE_PROMOTIONS && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4">Quản lý Khuyến mãi (Vouchers)</h2>
            <form onSubmit={handleSubmitVoucher} className="flex flex-wrap gap-3 mb-6 bg-green-50 p-4 rounded-lg border border-green-100">
              <input 
                type="text" placeholder="Mã (VD: SALE10)" required
                className="w-40 border px-3 py-2 rounded focus:ring uppercase"
                value={editingVoucher.code} onChange={e => setEditingVoucher({...editingVoucher, code: e.target.value.toUpperCase()})}
              />
              <select 
                className="w-40 border px-3 py-2 rounded focus:ring"
                value={editingVoucher.type} onChange={e => setEditingVoucher({...editingVoucher, type: e.target.value})}
              >
                <option value="percent">Giảm theo %</option>
                <option value="fixed">Giảm tiền mặt</option>
              </select>
              <input 
                type="number" placeholder={editingVoucher.type === 'percent' ? "Phần trăm (VD: 10)" : "Tiền mặt (VD: 20000)"} required
                className="w-48 border px-3 py-2 rounded focus:ring"
                value={editingVoucher.value} onChange={e => setEditingVoucher({...editingVoucher, value: e.target.value})}
              />
              <input 
                type="number" placeholder="Đơn tối thiểu (VNĐ)" required
                className="w-48 border px-3 py-2 rounded focus:ring"
                value={editingVoucher.min_order_value} onChange={e => setEditingVoucher({...editingVoucher, min_order_value: e.target.value})}
              />
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-bold flex-shrink-0">
                Tạo Voucher
              </button>
            </form>

            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border-b">Mã Voucher</th>
                  <th className="p-3 border-b">Loại giảm</th>
                  <th className="p-3 border-b">Mức giảm</th>
                  <th className="p-3 border-b">Đơn tối thiểu</th>
                  <th className="p-3 border-b text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50 border-b">
                    <td className="p-3 font-bold text-green-700">{v.code}</td>
                    <td className="p-3">{v.type === 'percent' ? 'Phần trăm (%)' : 'Tiền mặt (VNĐ)'}</td>
                    <td className="p-3 font-semibold text-gray-700">{v.type === 'percent' ? `${v.value}%` : `${v.value.toLocaleString()}đ`}</td>
                    <td className="p-3">{v.min_order_value.toLocaleString()}đ</td>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => toggleVoucherActive(v)}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${v.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {v.is_active ? 'Đang hoạt động' : 'Đã khóa'}
                      </button>
                    </td>
                  </tr>
                ))}
                {vouchers.length === 0 && <tr><td colSpan="5" className="text-center p-4 text-gray-400">Chưa có voucher nào</td></tr>}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

export default Admin;
