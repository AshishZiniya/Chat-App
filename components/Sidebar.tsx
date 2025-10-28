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
  return (
    <aside className="w-full md:w-80 bg-white border rounded-lg p-3 h-full flex flex-col" aria-label="Contacts and profile">
      <div className="mb-3">
        <label htmlFor="search-users" className="visually-hidden">Search users</label>
        <input id="search-users" placeholder="Search users" className="w-full p-2 rounded-lg border input-ghost" />
      </div>

      <nav className="flex-1 overflow-auto" aria-label="User contacts">
        <h3 className="text-xs text-muted uppercase mb-2">Contacts</h3>
        <ul role="list" className="space-y-1">
          {users
            .filter((u: User) => (meId ? u._id !== meId : u.username !== meUsername))
            .map((u: User) => (
              <li
                key={u._id}
                onClick={() => onSelect(u)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') onSelect(u); }}
                className={`p-2 rounded cursor-pointer flex items-center gap-3 ${
                  activeUser?._id === u._id ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative shrink-0">
                  <Image
                    src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}`}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full"
                    alt={`${u.username} avatar`}
                    unoptimized
                  />
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${u.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                </div>
                <div>
                  <div className="font-medium">{u.username}</div>
                  <div className="text-xs text-muted">{u.online ? 'Online' : 'Offline'}</div>
                </div>
              </li>
            ))}
        </ul>
      </nav>
    </aside>
  );
}
