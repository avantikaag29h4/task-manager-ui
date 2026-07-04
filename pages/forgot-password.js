import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit() {
    const res = await fetch(`${API}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok) setMessage(data.message);
    else setError(data.message);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-2 text-center">Forgot Password</h2>
        <p className="text-gray-400 text-sm text-center mb-6">Enter your email and we'll send you a reset link</p>

        {message && <p className="text-green-600 text-sm mb-4 text-center">{message}</p>}
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <input
          className="w-full border p-2 rounded mb-4"
          type="email"
          placeholder="Your email"
          onChange={e => setEmail(e.target.value)}
        />
        <button onClick={handleSubmit} className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
          Send Reset Link
        </button>
        <p className="mt-4 text-center text-sm">
          <a href="/" className="text-indigo-600">Back to Login</a>
        </p>
      </div>
    </div>
  );
}