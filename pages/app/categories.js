import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  function getToken() { return localStorage.getItem('token'); }

  useEffect(() => {
    loadCategories();
    loadTasks();
  }, []);

  async function loadCategories() {
    const res = await fetch(`${API}/tasks/categories`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    setCategories(data.categories || []);
  }

  async function loadTasks() {
    const res = await fetch(`${API}/tasks`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    setTasks(data.tasks || []);
  }

  async function addCategory() {
    if (!newCategory.trim()) return;
    await fetch(`${API}/tasks/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ name: newCategory })
    });
    setNewCategory('');
    loadCategories();
  }

  async function deleteCategory(id) {
    const confirmed = confirm('Delete this category? Tasks inside will not be deleted.');
    if (!confirmed) return;
    await fetch(`${API}/tasks/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    loadCategories();
  }

  const catColors = ['#534AB7', '#1D9E75', '#D85A30', '#D4537E', '#185FA5', '#BA7517'];

  return (
    <Layout currentPage="categories">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-lg font-medium text-gray-800">Categories</h1>
          <p className="text-xs text-gray-400 mt-0.5">{categories.length} categories</p>
        </div>
      </div>

      {/* Add category */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 flex gap-3">
        <input
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          placeholder="New category name..."
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCategory()}
        />
        <button
          onClick={addCategory}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          Add
        </button>
      </div>

      {/* Category list */}
      {categories.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-400 text-sm">No categories yet.</p>
          <p className="text-gray-300 text-xs mt-1">Add one above!</p>
        </div>
      ) : (
        categories.map((cat, i) => {
          const color = catColors[i % catColors.length];
          const taskCount = tasks.filter(t => t.category_id === cat.id).length;
          const completedCount = tasks.filter(t => t.category_id === cat.id && t.status === 'COMPLETED').length;
          const inProgressCount = tasks.filter(t => t.category_id === cat.id && t.status === 'INPROGRESS').length;

          return (
            <div key={cat.id} className="bg-white border border-gray-200 rounded-xl p-4 mb-3 flex items-center gap-4">
              {/* Color dot */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + '22' }}>
                <div className="w-4 h-4 rounded-full" style={{ background: color }}></div>
              </div>

              {/* Category info */}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{cat.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-400">{taskCount} tasks</span>
                  {inProgressCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                      {inProgressCount} in progress
                    </span>
                  )}
                  {completedCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                      {completedCount} completed
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {taskCount > 0 && (
                <div className="w-24">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-400">Progress</span>
                    <span className="text-xs text-gray-400">{Math.round((completedCount / taskCount) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${(completedCount / taskCount) * 100}%`, background: color }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Delete */}
              <button
                onClick={() => deleteCategory(cat.id)}
                className="text-xs text-red-400 hover:text-red-600 flex-shrink-0"
              >
                Delete
              </button>
            </div>
          );
        })
      )}
    </Layout>
  );
}