import { useState } from 'react';
import { useRouter } from 'next/router';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { token } = router.query;

  async function handleReset() {
    // Check passwords match before sending to backend
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const res = await fetch(`${API}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Password reset! Redirecting to login...');
      setTimeout(() => router.push('/'), 2000);
    } else {
      setError(data.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>

        {message && <p className="text-green-600 text-sm mb-4 text-center">{message}</p>}
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <input
          className="w-full border p-2 rounded mb-3"
          type="password"
          placeholder="New password"
          onChange={e => setNewPassword(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded mb-4"
          type="password"
          placeholder="Confirm new password"
          onChange={e => setConfirmPassword(e.target.value)}
        />
        <button onClick={handleReset} className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
          Reset Password
        </button>
      </div>
    </div>
  );
}