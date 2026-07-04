import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handleLogin() {
    const res = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
  
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ username: username }));  // ← add
      router.push('/app/dashboard');  // ← change
    } else {
      alert(data.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <input className="w-full border p-2 rounded mb-3" type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} />
        <input className="w-full border p-2 rounded mb-4" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
        <button onClick={handleLogin} className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
          Login
        </button>
        <p className="mt-4 text-center text-sm">
        No account? <a href="/register" className="text-indigo-600">Register</a>
        </p>
        <p className="mt-2 text-center text-sm">
        <a href="/forgot-password" className="text-indigo-600">Forgot password?</a>
        </p>
      </div>
    </div>
  );
}