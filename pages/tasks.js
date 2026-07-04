import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const router = useRouter();

  function getToken() {
    return localStorage.getItem('token');
  }

  useEffect(() => {
    if (!getToken()) { router.push('/'); return; }
    loadTasks();
    loadCategories();
  }, []);

  async function loadTasks(statusFilter = '') {
    const query = statusFilter ? `?status=${statusFilter}` : '';
    const res = await fetch(`${API}/tasks${query}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) setTasks(data);
    else if (data.tasks) setTasks(data.tasks);
    else setTasks([]);
  }

  async function addTask() {
    if (!title.trim()) return;
    const url = selectedCategory
      ? `${API}/tasks/categories/${selectedCategory}/tasks`
      : `${API}/tasks`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ title, description, status })
    });
    setTitle(''); setDescription(''); setStatus('TODO'); setSelectedCategory('');
    loadTasks();
  }

  async function deleteTask(id) {
    await fetch(`${API}/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    loadTasks();
  }

  async function updateStatus(id, newStatus) {
    await fetch(`${API}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ status: newStatus })
    });
    loadTasks();
  }

  async function loadCategories() {
    const res = await fetch(`${API}/tasks/categories`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) setCategories(data);
    else if (data.categories) setCategories(data.categories);
    else setCategories([]);
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
    await fetch(`${API}/tasks/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    loadCategories();
  }

  function logout() {
    localStorage.removeItem('token');
    router.push('/');
  }

  async function handleDeleteAccount() {
    const confirmed = confirm('Are you sure? This will permanently delete your account and all your tasks!');
    if (!confirmed) return;
  
    await fetch(`${API}/auth/delete-account`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
  
    localStorage.removeItem('token');
    router.push('/');
  }

  const statusColors = {
    'TODO': 'bg-gray-100 text-gray-600',
    'INPROGRESS': 'bg-blue-100 text-blue-600',
    'COMPLETED': 'bg-green-100 text-green-600',
    'ABORTED': 'bg-red-100 text-red-600'
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
        <div className="flex gap-4">
        <button onClick={handleDeleteAccount} className="text-sm text-gray-400 hover:text-red-500 hover:underline">
        Delete Account
        </button>
        <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
        </div>
        {/* Categories */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-3">Categories</h2>
          <div className="flex gap-2 mb-3">
            <input
              className="flex-1 border p-2 rounded"
              placeholder="New category name..."
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
            />
            <button onClick={addCategory} className="bg-indigo-600 text-white px-4 rounded hover:bg-indigo-700">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.length === 0
              ? <p className="text-gray-400 text-sm">No categories yet.</p>
              : categories.map(cat => (
                  <span key={cat.id} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                    {cat.name}
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="text-indigo-400 hover:text-red-500 font-bold ml-1"
                    >×</button>
                  </span>
                ))
            }
          </div>
        </div>

        {/* Add Task */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-semibold mb-3">Add New Task</h2>
          <input className="w-full border p-2 rounded mb-2" placeholder="Task title..." value={title} onChange={e => setTitle(e.target.value)} />
          <input className="w-full border p-2 rounded mb-2" placeholder="Description (optional)..." value={description} onChange={e => setDescription(e.target.value)} />
          <select className="w-full border p-2 rounded mb-2" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            <option value="">No category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <select className="flex-1 border p-2 rounded" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="TODO">To Do</option>
              <option value="INPROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ABORTED">Aborted</option>
            </select>
            <button onClick={addTask} className="bg-indigo-600 text-white px-6 rounded hover:bg-indigo-700">Add Task</button>
          </div>
        </div>

        {/* Task List */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Tasks</h2>
            <select className="border p-1 rounded text-sm" value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); loadTasks(e.target.value); }}>
              <option value="">All</option>
              <option value="TODO">To Do</option>
              <option value="INPROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="ABORTED">Aborted</option>
            </select>
          </div>
          {tasks.length === 0
            ? <p className="text-gray-400 text-center py-4">No tasks yet. Add one above!</p>
            : tasks.map(task => (
                <div key={task.id} className="flex justify-between items-start border-b py-3 last:border-0">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    {task.description && <p className="text-sm text-gray-400">{task.description}</p>}
                    {task.category_id && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        {categories.find(cat => cat.id === task.category_id)?.name || 'Unknown'}
                      </span>
                    )}
                    <select
                      className={`mt-1 text-xs px-2 py-1 rounded-full ${statusColors[task.status]}`}
                      value={task.status}
                      onChange={e => updateStatus(task.id, e.target.value)}
                    >
                      <option value="TODO">To Do</option>
                      <option value="INPROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="ABORTED">Aborted</option>
                    </select>
                  </div>
                  <button onClick={() => deleteTask(task.id)} className="text-red-400 hover:text-red-600 text-sm ml-4">Delete</button>
                </div>
              ))
          }
        </div>

      </div>
    </div>
  );
}