import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Register() {
  const [form, setForm] = useState({
    name: '', age: '', phone: '', email: '', username: '', password: '', confirm_password: ''
  });
  const router = useRouter();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleRegister() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
  
      const text = await res.text();  // read as text first
      const data = JSON.parse(text);  // then parse
  
      if (res.ok) {
        alert('Account created! Please login.');
        router.push('/');
      } else {
        alert(data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Could not connect to server. Is your backend running?');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

        {['name', 'age', 'phone', 'email', 'username'].map(field => (
          <input
            key={field}
            name={field}
            type={field === 'email' ? 'email' : field === 'age' ? 'number' : 'text'}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            onChange={handleChange}
            className="w-full border p-2 rounded mb-3"
          />
        ))}

        <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full border p-2 rounded mb-3" />
        <input name="confirm_password" type="password" placeholder="Confirm Password" onChange={handleChange} className="w-full border p-2 rounded mb-4" />

        <button onClick={handleRegister} className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
          Register
        </button>
        <p className="mt-4 text-center text-sm">
          Already have an account? <a href="/" className="text-indigo-600">Login</a>
        </p>
      </div>
    </div>
  );
}