import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  function getToken() { return localStorage.getItem('token'); }

  useEffect(() => {
    loadTasks();
    loadCategories();
  }, []);

  async function loadTasks(statusFilter = '') {
    const query = statusFilter ? `?status=${statusFilter}` : '';
    const res = await fetch(`${API}/tasks${query}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    const all = data.tasks || [];
    setTasks(all.sort((a, b) => a.priority - b.priority));
  }

  async function loadCategories() {
    const res = await fetch(`${API}/tasks/categories`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    setCategories(data.categories || []);
  }

  async function deleteTask(id) {
    await fetch(`${API}/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    loadTasks(filterStatus);
  }

  async function updateStatus(id, status) {
    await fetch(`${API}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ status })
    });
    loadTasks(filterStatus);
  }

  const catColors = ['#534AB7', '#1D9E75', '#D85A30', '#D4537E', '#185FA5', '#BA7517'];
  const statusStyles = {
    TODO: 'bg-gray-100 text-gray-600',
    INPROGRESS: 'bg-blue-50 text-blue-600',
    COMPLETED: 'bg-green-50 text-green-600',
    ABORTED: 'bg-red-50 text-red-500'
  };
  const priorityStyles = {
    1: 'bg-red-50 text-red-500',
    2: 'bg-orange-50 text-orange-500',
    3: 'bg-indigo-50 text-indigo-500',
    4: 'bg-green-50 text-green-500',
    5: 'bg-gray-100 text-gray-500'
  };

  const filteredTasks = tasks.filter(t => {
    if (filterCategory && t.category_id !== parseInt(filterCategory)) return false;
    return true;
  });

  return (
    <Layout currentPage="tasks">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-lg font-medium text-gray-800">All tasks</h1>
        <div className="flex gap-2">
          {/* Filter by status */}
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500"
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); loadTasks(e.target.value); }}
          >
            <option value="">All statuses</option>
            <option value="TODO">To do</option>
            <option value="INPROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="ABORTED">Aborted</option>
          </select>

          {/* Filter by category */}
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredTasks.length === 0
        ? <p className="text-sm text-gray-400">No tasks found.</p>
        : filteredTasks.map(task => {
            const catIndex = categories.findIndex(c => c.id === task.category_id);
            const cat = categories[catIndex];
            const catColor = catColors[catIndex % catColors.length];

            return (
              <div key={task.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 mb-2">
                {/* Check circle */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer ${task.status === 'COMPLETED' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                  onClick={() => updateStatus(task.id, task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED')}
                >
                  {task.status === 'COMPLETED' && <span className="text-white text-xs">✓</span>}
                </div>

                {/* Task info */}
                <div className="flex-1">
                  <p className={`text-sm ${task.status === 'COMPLETED' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </p>
                  {task.description && <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {cat && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: catColor + '22', color: catColor }}>
                        {cat.name}
                      </span>
                    )}
                    {task.due_date && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                        {task.due_date?.split('T')[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status dropdown */}
                <select
                  className={`text-xs px-2 py-1 rounded-full border-0 ${statusStyles[task.status]}`}
                  value={task.status}
                  onChange={e => updateStatus(task.id, e.target.value)}
                >
                  <option value="TODO">To do</option>
                  <option value="INPROGRESS">In progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ABORTED">Aborted</option>
                </select>

                {/* Priority badge */}
                {task.priority && (
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium flex-shrink-0 ${priorityStyles[task.priority]}`}>
                    {task.priority}
                  </div>
                )}

                {/* Delete */}
                <button onClick={() => deleteTask(task.id)} className="text-xs text-red-400 hover:text-red-600 flex-shrink-0">
                  Delete
                </button>
              </div>
            );
          })
      }
    </Layout>
  );
}