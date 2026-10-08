import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white mb-3">
        404
      </h1>
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
        Page Not Found
      </h2>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        The story or page you are looking for doesn't exist or has been relocated.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
      >
        Return to Home
      </Link>
    </div>
  );
};
