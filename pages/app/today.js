import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function Today() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);

  function getToken() { return localStorage.getItem('token'); }

  useEffect(() => {
    loadTasks();
    loadCategories();
  }, []);

  async function loadTasks() {
    const res = await fetch(`${API}/tasks/today`, {
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

  async function updateStatus(id, status) {
    await fetch(`${API}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ status })
    });
    loadTasks();
  }

  async function deleteTask(id) {
    await fetch(`${API}/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    loadTasks();
  }

  const today = new Date().toISOString().split('T')[0];
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

  const pending = tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'ABORTED');
  const completed = tasks.filter(t => t.status === 'COMPLETED');

  return (
    <Layout currentPage="today">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-lg font-medium text-gray-800">Today</h1>
          <p className="text-xs text-gray-400 mt-0.5">{today} — {pending.length} pending, {completed.length} completed</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <p className="text-gray-400 text-sm">No tasks due today.</p>
          <p className="text-gray-300 text-xs mt-1">Click "+ Add Task" to add one!</p>
        </div>
      ) : (
        <>
          {/* Pending tasks */}
          {pending.length > 0 && (
            <>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Pending</p>
              {pending.map(task => {
                const catIndex = categories.findIndex(c => c.id === task.category_id);
                const cat = categories[catIndex];
                const catColor = catColors[catIndex % catColors.length];
                return (
                  <div key={task.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 mb-2">
                    <div
                      className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0 cursor-pointer hover:border-green-400"
                      onClick={() => updateStatus(task.id, 'COMPLETED')}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{task.title}</p>
                      {task.description && <p className="text-xs text-gray-400 mt-0.5">{task.description}</p>}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {cat && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: catColor + '22', color: catColor }}>
                            {cat.name}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[task.status]}`}>
                          {task.status === 'TODO' ? 'To do' : 'In progress'}
                        </span>
                      </div>
                    </div>
                    {task.priority && (
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium flex-shrink-0 ${priorityStyles[task.priority]}`}>
                        {task.priority}
                      </div>
                    )}
                    <button onClick={() => deleteTask(task.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                  </div>
                );
              })}
            </>
          )}

          {/* Completed tasks */}
          {completed.length > 0 && (
            <>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-5 mb-2">Completed</p>
              {completed.map(task => {
                const catIndex = categories.findIndex(c => c.id === task.category_id);
                const cat = categories[catIndex];
                const catColor = catColors[catIndex % catColors.length];
                return (
                  <div key={task.id} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 mb-2 opacity-60">
                    <div
                      className="w-5 h-5 rounded-full bg-green-500 border-2 border-green-500 flex items-center justify-center flex-shrink-0 cursor-pointer"
                      onClick={() => updateStatus(task.id, 'TODO')}
                    >
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 line-through">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {cat && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: catColor + '22', color: catColor }}>
                            {cat.name}
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">Completed</span>
                      </div>
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                  </div>
                );
              })}
            </>
          )}
        </>
      )}
    </Layout>
  );
}