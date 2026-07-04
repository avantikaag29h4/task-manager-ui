import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, inprogress: 0, completed: 0, overdue: 0 });
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [tomorrowTasks, setTomorrowTasks] = useState([]);
  const [categories, setCategories] = useState([]);

  function getToken() { return localStorage.getItem('token'); }

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const headers = { Authorization: `Bearer ${getToken()}` };

    const [allRes, todayRes, overdueRes, upcomingRes, catRes] = await Promise.all([
      fetch(`${API}/tasks`, { headers }),
      fetch(`${API}/tasks/today`, { headers }),
      fetch(`${API}/tasks/overdue`, { headers }),
      fetch(`${API}/tasks/upcoming`, { headers }),
      fetch(`${API}/tasks/categories`, { headers }),
    ]);

    const allData = await allRes.json();
    const todayData = await todayRes.json();
    const overdueData = await overdueRes.json();
    const upcomingData = await upcomingRes.json();
    const catData = await catRes.json();

    const all = allData.tasks || [];
    const today = todayData.tasks || [];
    const overdue = overdueData.tasks || [];
    const upcoming = upcomingData.tasks || [];
    const cats = catData.categories || [];

    setCategories(cats);
    setOverdueTasks(overdue);
    setTodayTasks(today);

    // get tomorrow's tasks from upcoming
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    setTomorrowTasks(upcoming.filter(t => t.due_date === tomorrowStr));

    setStats({
      total: all.length,
      inprogress: all.filter(t => t.status === 'INPROGRESS').length,
      completed: all.filter(t => t.status === 'COMPLETED').length,
      overdue: overdue.length
    });
  }

  return (
    <Layout currentPage="dashboard">
      <h1 className="text-lg font-medium text-gray-800 mb-5">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Total tasks</p>
          <p className="text-2xl font-medium text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">In progress</p>
          <p className="text-2xl font-medium text-blue-600">{stats.inprogress}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Completed</p>
          <p className="text-2xl font-medium text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Overdue</p>
          <p className="text-2xl font-medium text-red-500">{stats.overdue}</p>
        </div>
      </div>

      {/* Overdue */}
      {overdueTasks.length > 0 && (
        <>
          <h2 className="text-sm font-medium text-gray-500 mb-3">Overdue</h2>
          {overdueTasks.map(task => (
            <TaskCard key={task.id} task={task} categories={categories} overdue />
          ))}
        </>
      )}

      {/* Today */}
      <h2 className="text-sm font-medium text-gray-500 mt-5 mb-3">Today</h2>
      {todayTasks.length === 0
        ? <p className="text-sm text-gray-400">No tasks due today.</p>
        : todayTasks.map(task => <TaskCard key={task.id} task={task} categories={categories} />)
      }

      {/* Tomorrow */}
      <h2 className="text-sm font-medium text-gray-500 mt-5 mb-3">Tomorrow</h2>
      {tomorrowTasks.length === 0
        ? <p className="text-sm text-gray-400">No tasks due tomorrow.</p>
        : tomorrowTasks.map(task => <TaskCard key={task.id} task={task} categories={categories} />)
      }
    </Layout>
  );
}

function TaskCard({ task, categories, overdue }) {
  const cat = categories.find(c => c.id === task.category_id);
  const catColors = ['#534AB7', '#1D9E75', '#D85A30', '#D4537E', '#185FA5', '#BA7517'];
  const catIndex = categories.findIndex(c => c.id === task.category_id);
  const catColor = catColors[catIndex % catColors.length];

  const statusStyles = {
    TODO: 'bg-gray-100 text-gray-600',
    INPROGRESS: 'bg-blue-50 text-blue-600',
    COMPLETED: 'bg-green-50 text-green-600',
    ABORTED: 'bg-red-50 text-red-500'
  };
  const statusLabels = { TODO: 'To do', INPROGRESS: 'In progress', COMPLETED: 'Completed', ABORTED: 'Aborted' };
  const priorityStyles = { 1: 'bg-red-50 text-red-500', 2: 'bg-orange-50 text-orange-500', 3: 'bg-indigo-50 text-indigo-500', 4: 'bg-green-50 text-green-500', 5: 'bg-gray-100 text-gray-500' };

  return (
    <div className={`flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 mb-2 ${overdue ? 'border-l-2 border-l-red-400' : ''}`}>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${task.status === 'COMPLETED' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
        {task.status === 'COMPLETED' && <span className="text-white text-xs">✓</span>}
      </div>
      <div className="flex-1">
        <p className={`text-sm ${task.status === 'COMPLETED' ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.title}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {cat && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: catColor + '22', color: catColor }}>
              {cat.name}
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyles[task.status]}`}>
            {statusLabels[task.status]}
          </span>
          {task.due_date && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${overdue ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'}`}>
              {overdue ? 'Overdue: ' : ''}{task.due_date?.split('T')[0]}
            </span>
          )}
        </div>
      </div>
      {task.priority && (
        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium ${priorityStyles[task.priority]}`}>
          {task.priority}
        </div>
      )}
    </div>
  );
}