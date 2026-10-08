import React from 'react';
import { Link } from 'react-router-dom';
import { X, UserPlus, UserCheck } from 'lucide-react';

export const UserListModal = ({ isOpen, onClose, title = 'Users', users = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 relative max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-4 flex-1">
          {users.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">No users to display.</p>
          ) : (
            users.map((u) => (
              <div key={u._id} className="flex items-center justify-between gap-3">
                <Link
                  to={`/profile/${u.username}`}
                  onClick={onClose}
                  className="flex items-center gap-3 group flex-1 min-w-0"
                >
                  <img
                    src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                    alt={u.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-800"
                  />
                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 truncate">
                      {u.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">@{u.username}</p>
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
