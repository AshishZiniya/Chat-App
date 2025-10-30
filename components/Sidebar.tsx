'use client';
import React from 'react';
import Image from 'next/image';
import { FaSearch, FaUsers, FaCheck } from 'react-icons/fa';
import type { User } from '../types';

interface SidebarProps {
  users: User[];
  meUsername: string;
  meId?: string;
  onSelect: (user: User) => void;
  activeUser?: User | null;
  onLogout: () => void;
}

export default function Sidebar({ users, meUsername, meId, onSelect, activeUser }: SidebarProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredUsers = React.useMemo(() =>
    users
      .filter((u: User) => (meId ? u._id !== meId : u.username !== meUsername))
      .filter((u: User) => u.username.toLowerCase().includes(searchTerm.toLowerCase())),
    [users, meId, meUsername, searchTerm]
  );

  return (
    <aside className="w-full md:w-80 bg-white p-4 h-full flex flex-col shadow-sm" aria-label="Contacts and profile">
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Search contacts</label>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <FaSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            id="search-users"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
      </div>

      <nav className="flex-1 overflow-auto" aria-label="User contacts">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Contacts</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {filteredUsers.length}
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <FaUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {searchTerm ? 'No contacts found' : 'No contacts yet'}
            </p>
          </div>
        ) : (
          <ul role="list" className="space-y-2">
            {filteredUsers.map((u: User) => (
              <li
                key={u._id}
                onClick={() => onSelect(u)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') onSelect(u); }}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-3 group ${
                  activeUser?._id === u._id
                    ? 'bg-blue-50 border border-blue-200 shadow-sm'
                    : 'hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                <div className="relative shrink-0">
                  <Image
                    src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}`}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all duration-200"
                    alt={`${u.username} avatar`}
                    unoptimized
                  />
                  <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${u.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{u.username}</div>
                  <div className={`text-xs flex items-center gap-1 ${u.online ? 'text-green-600' : 'text-gray-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${u.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    {u.online ? 'Online' : 'Offline'}
                  </div>
                </div>
                {activeUser?._id === u._id && (
                  <FaCheck className="w-5 h-5 text-blue-500" />
                )}
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
}
