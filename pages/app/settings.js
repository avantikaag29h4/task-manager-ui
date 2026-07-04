import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function Settings() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();

  function getToken() { return localStorage.getItem('token'); }

  const user = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : {};

  async function handleChangePassword() {
    setPasswordMsg('');
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    const res = await fetch(`${API}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();

    if (res.ok) {
      setPasswordMsg('Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } else {
      setPasswordError(data.message);
    }
  }

  async function handleDeleteAccount() {
    await fetch(`${API}/auth/delete-account`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  }

  return (
    <Layout currentPage="settings">
      <h1 className="text-lg font-medium text-gray-800 mb-5">Settings</h1>

      {/* Profile info */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Profile</h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-base font-medium">
            {user.username?.slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{user.username || 'User'}</p>
            <p className="text-xs text-gray-400">Logged in</p>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Change password</h2>

        {passwordMsg && <p className="text-green-600 text-xs mb-3">{passwordMsg}</p>}
        {passwordError && <p className="text-red-500 text-xs mb-3">{passwordError}</p>}

        <input
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-indigo-400"
        />
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-indigo-400"
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-indigo-400"
        />
        <button
          onClick={handleChangePassword}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          Update password
        </button>
      </div>

      {/* Danger zone */}
      <div className="bg-white border border-red-200 rounded-xl p-5">
        <h2 className="text-sm font-medium text-red-500 mb-1">Danger zone</h2>
        <p className="text-xs text-gray-400 mb-4">Once you delete your account, all your tasks and categories will be permanently deleted.</p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm text-red-500 border border-red-300 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100"
          >
            Delete account
          </button>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600 font-medium mb-3">Are you sure? This cannot be undone!</p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Yes, delete my account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-sm border border-gray-200 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}