import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, TrendingUp, Package, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = `http://${window.location.hostname}:3001/api`;

function Admin({ user, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('reports'); // reports, menu
  
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [newCategory, setNewCategory] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category_id: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [repRes, catRes, prodRes] = await Promise.all([
      axios.get(`${API_URL}/reports/daily`),
      axios.get(`${API_URL}/categories`),
      axios.get(`${API_URL}/products`)
    ]);
    setReports(repRes.data);
    setCategories(catRes.data);
    setProducts(prodRes.data);
    if (catRes.data.length > 0 && !newProduct.category_id) {
        setNewProduct(prev => ({...prev, category_id: catRes.data[0].id}));
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory) return;
    await axios.post(`${API_URL}/categories`, { name: newCategory });
    setNewCategory('');
    fetchData();
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Xóa danh mục sẽ xóa tất cả món ăn trong đó. Bạn chắc chứ?")) return;
    await axios.delete(`${API_URL}/categories/${id}`);
    fetchData();
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    await axios.post(`${API_URL}/products`, newProduct);
    setNewProduct({ name: '', price: '', category_id: categories.length > 0 ? categories[0].id : '' });
    fetchData();
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Bạn muốn xóa món này?")) return;
    await axios.delete(`${API_URL}/products/${id}`);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
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
            Báo cáo doanh thu
          </button>
          <button onClick={() => setActiveTab('menu')} className={`px-6 py-3 rounded-lg font-semibold transition ${activeTab === 'menu' ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
            Quản lý Thực đơn
          </button>
        </div>

        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4">Doanh thu theo ngày</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-600">
                    <th className="p-4 rounded-tl-lg">Ngày</th>
                    <th className="p-4">Số đơn hàng</th>
                    <th className="p-4 rounded-tr-lg">Tổng doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-4 font-semibold">{r.date}</td>
                      <td className="p-4">{r.total_orders} đơn</td>
                      <td className="p-4 text-green-600 font-bold">{r.revenue.toLocaleString('vi-VN')} đ</td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr><td colSpan="3" className="p-4 text-center text-gray-500">Chưa có dữ liệu bán hàng</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cột Danh mục */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Tag size={20}/> Danh mục món</h2>
              <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                <input 
                  type="text" placeholder="Tên danh mục mới" required
                  className="flex-1 border px-3 py-2 rounded focus:outline-blue-500"
                  value={newCategory} onChange={e => setNewCategory(e.target.value)}
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"><Plus size={20}/></button>
              </form>
              <ul className="space-y-2">
                {categories.map(cat => (
                  <li key={cat.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                    <span className="font-medium">{cat.name}</span>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={18}/></button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cột Sản phẩm */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Package size={20}/> Danh sách món</h2>
              <form onSubmit={handleAddProduct} className="flex flex-col gap-3 mb-6 bg-gray-50 p-4 rounded border">
                <select 
                  className="border px-3 py-2 rounded" required
                  value={newProduct.category_id} onChange={e => setNewProduct({...newProduct, category_id: e.target.value})}
                >
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                <input 
                  type="text" placeholder="Tên món" required
                  className="border px-3 py-2 rounded"
                  value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                />
                <div className="flex gap-2">
                  <input 
                    type="number" placeholder="Giá tiền (VNĐ)" required
                    className="flex-1 border px-3 py-2 rounded"
                    value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                  />
                  <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-1"><Plus size={18}/> Thêm</button>
                </div>
              </form>

              <div className="max-h-96 overflow-y-auto">
                <ul className="space-y-2">
                  {products.map(prod => (
                    <li key={prod.id} className="flex justify-between items-center bg-white p-3 rounded border">
                      <div>
                        <div className="font-semibold">{prod.name}</div>
                        <div className="text-sm text-green-600">{prod.price.toLocaleString('vi-VN')} đ</div>
                      </div>
                      <button onClick={() => handleDeleteProduct(prod.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
