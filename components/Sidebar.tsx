'use client';
import React from 'react';
import Image from 'next/image';

type User = {
  _id: string;
  username: string;
  avatar?: string;
  online?: boolean;
};

type SidebarProps = {
  users: User[];
  meUsername: string;
  meId?: string;
  onSelect: (user: User) => void;
  activeUser?: User | null;
  onLogout: () => void;
};

export default function Sidebar({ users, meUsername, meId, onSelect, activeUser }: SidebarProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredUsers = users
    .filter((u: User) => (meId ? u._id !== meId : u.username !== meUsername))
    .filter((u: User) => u.username.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <aside className="w-full md:w-80 bg-white border rounded-xl p-4 h-full flex flex-col shadow-sm" aria-label="Contacts and profile">
      <div className="mb-4">
        <div className="relative">
          <label htmlFor="search-users" className="visually-hidden">Search users</label>
          <input
            id="search-users"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-ghost w-full pl-10 pr-4 py-3 text-sm"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
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
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
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
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
}
