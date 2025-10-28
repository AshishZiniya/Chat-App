'use client';
import React, { useState } from 'react';
import axios from 'axios';

interface RegisterProps {
  onRegister: (token: string) => void;
  onCancel: () => void;
}

export default function Register({ onRegister, onCancel }: RegisterProps) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    avatar: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await axios.post('http://localhost:3001/auth/register', form);
      onRegister(data.accessToken);
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Registration failed'
          : 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 w-full">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

        {error && <p className="text-red-600 text-sm mb-3 text-center">{error}</p>}

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Username
        </label>
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Choose a username"
          required
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter a password"
          type="password"
          required
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Avatar URL (optional)
        </label>
        <input
          name="avatar"
          value={form.avatar}
          onChange={handleChange}
          placeholder="https://example.com/avatar.jpg"
          className="w-full mb-6 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        />

        <button
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg mb-3 transition disabled:opacity-60"
        >
          {loading ? 'Creating...' : 'Create Account'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition"
        >
          Back to Login
        </button>
      </form>
    </div>
  );
}
