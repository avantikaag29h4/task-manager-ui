import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
export default function Layout({ children, currentPage }) {
  const [categories, setCategories] = useState([]);
  const [username, setUsername] = useState('');
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  function getToken() {
    return localStorage.getItem('token');
  }

  useEffect(() => {
    if (!getToken()) { router.push('/'); return; }
    loadCategories();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUsername(user.username || 'User');
  }, []);

  async function loadCategories() {
    const res = await fetch(`${API}/tasks/categories`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    if (data.categories) setCategories(data.categories);
    else setCategories([]);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  }

  const catColors = ['#534AB7', '#1D9E75', '#D85A30', '#D4537E', '#185FA5', '#BA7517'];

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '⊞' },
    { key: 'tasks', label: 'All tasks', icon: '✓' },
    { key: 'today', label: 'Today', icon: '◷' },
    { key: 'upcoming', label: 'Upcoming', icon: '▷' },
    { key: 'categories', label: 'Categories', icon: '⊟' },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* Topbar */}
      <div className="flex items-center justify-between px-5 h-14 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">T</div>
          <span className="font-medium text-gray-800">Task Manager</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
          >
            + Add Task
          </button>
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-medium">
            {username.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-sm text-gray-500">{username}</span>
          <button onClick={logout} className="text-sm text-red-500 border border-red-300 px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100">
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <div className="w-52 bg-white border-r border-gray-200 flex flex-col py-4 flex-shrink-0">
          <p className="text-xs text-gray-400 uppercase tracking-wider px-4 mb-2">Menu</p>

          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => router.push(`/app/${item.key}`)}
              className={`flex items-center gap-2 px-3 py-2 mx-2 rounded-lg text-sm text-left mb-1 ${
                currentPage === item.key
                  ? 'bg-indigo-50 text-indigo-600 font-medium'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}

          <hr className="my-3 mx-4 border-gray-100" />
          <p className="text-xs text-gray-400 uppercase tracking-wider px-4 mb-2">Categories</p>

          {categories.map((cat, i) => (
            <div key={cat.id} className="flex items-center gap-2 px-4 py-1.5 text-sm text-gray-500 cursor-pointer hover:bg-gray-50 mx-2 rounded-lg">
              <div className="w-2 h-2 rounded-full" style={{ background: catColors[i % catColors.length] }}></div>
              {cat.name}
            </div>
          ))}

          <hr className="my-3 mx-4 border-gray-100" />
          <button
            onClick={() => router.push('/app/settings')}
            className={`flex items-center gap-2 px-3 py-2 mx-2 rounded-lg text-sm text-left ${
              currentPage === 'settings' ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span>⚙</span> Settings
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <AddTaskModal
          categories={categories}
          catColors={catColors}
          onClose={() => setShowModal(false)}
          onAdded={() => { setShowModal(false); router.reload(); }}
        />
      )}
    </div>
  );
}

function AddTaskModal({ categories, catColors, onClose, onAdded }) {
  const [form, setForm] = useState({ title: '', description: '', status: 'TODO', due_date: '', priority: 3, category_id: '' });

  function getToken() { return localStorage.getItem('token'); }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit() {
    if (!form.title.trim()) return alert('Title is required');
    const url = form.category_id
  ? `${API}/tasks/categories/${form.category_id}/tasks`
  : `${API}/tasks`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(form)
    });
    onAdded();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
        <h2 className="text-base font-medium mb-4">Add new task</h2>

        <input name="title" placeholder="Task title" onChange={handleChange} className="w-full border p-2 rounded-lg mb-3 text-sm" />
        <input name="description" placeholder="Description (optional)" onChange={handleChange} className="w-full border p-2 rounded-lg mb-3 text-sm" />

        <select name="category_id" onChange={handleChange} className="w-full border p-2 rounded-lg mb-3 text-sm">
          <option value="">No category</option>
          {categories.map((cat, i) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <input name="due_date" type="date" onChange={handleChange} className="w-full border p-2 rounded-lg mb-3 text-sm" />

        <select name="priority" onChange={handleChange} className="w-full border p-2 rounded-lg mb-3 text-sm">
          <option value="1">1 - Urgent</option>
          <option value="2">2 - High</option>
          <option value="3" selected>3 - Medium</option>
          <option value="4">4 - Low</option>
          <option value="5">5 - Minimal</option>
        </select>

        <select name="status" onChange={handleChange} className="w-full border p-2 rounded-lg mb-4 text-sm">
          <option value="TODO">To Do</option>
          <option value="INPROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="ABORTED">Aborted</option>
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg text-gray-500 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add task</button>
        </div>
      </div>
    </div>
  );
}