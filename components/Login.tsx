'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { FaComments, FaUser, FaLock, FaSpinner, FaSignInAlt } from 'react-icons/fa';

interface LoginProps {
  onLogin: (token: string) => void;
  onShowRegister: () => void;
}

export default function Login({ onLogin, onShowRegister }: LoginProps) {
  const [form, setForm] = useState({ username: '', password: '' });
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
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}auth/login`, form);
      onLogin(data.accessToken);
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err)
          ? err.response?.data?.message || 'Invalid username or password'
          : 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 w-full">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <FaComments className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-600">Sign in to your account</p>
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
                placeholder="Enter your username"
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
                placeholder="Enter your password"
                type="password"
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                Signing in...
              </>
            ) : (
              <>
                <FaSignInAlt className="w-4 h-4" />
                Sign in
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don&#39;t have an account?{' '}
            <button
              type="button"
              onClick={onShowRegister}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
