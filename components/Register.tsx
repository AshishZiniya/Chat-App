'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { FaUserPlus, FaUser, FaLock, FaImage, FaArrowLeft, FaSpinner } from 'react-icons/fa';

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
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, form);
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
      <div className="card p-8 w-full max-w-md animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-linear-to-br from-green-500 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <FaUserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Join our chat community</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Username
            </label>
            <div className="relative mb-6">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                <FaUser className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Password
            </label>
            <div className="relative mb-6">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                <FaLock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter a password"
                type="password"
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Avatar URL <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <div className="relative mb-6">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                <FaImage className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                name="avatar"
                value={form.avatar}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                Creating...
              </>
            ) : (
              <>
                <FaUserPlus className="w-4 h-4" />
                Create Account
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}
