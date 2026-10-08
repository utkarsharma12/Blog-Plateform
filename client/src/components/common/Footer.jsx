import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart } from 'lucide-react';
import { GithubIcon, TwitterIcon, LinkedinIcon } from './SocialIcons';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                Inkflow
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              The modern publishing and community platform for curious minds, passionate writers, and software builders.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <GithubIcon className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <TwitterIcon className="w-5 h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <LinkedinIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>
                <Link to="/explore?category=Technology" className="hover:text-indigo-600 dark:hover:text-indigo-400">Technology</Link>
              </li>
              <li>
                <Link to="/explore?category=Artificial+Intelligence" className="hover:text-indigo-600 dark:hover:text-indigo-400">Artificial Intelligence</Link>
              </li>
              <li>
                <Link to="/explore?category=Web+Development" className="hover:text-indigo-600 dark:hover:text-indigo-400">Web Development</Link>
              </li>
              <li>
                <Link to="/explore?category=Cybersecurity" className="hover:text-indigo-600 dark:hover:text-indigo-400">Cybersecurity</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>
                <Link to="/explore" className="hover:text-indigo-600 dark:hover:text-indigo-400">All Stories</Link>
              </li>
              <li>
                <Link to="/explore?sort=trending" className="hover:text-indigo-600 dark:hover:text-indigo-400">Trending</Link>
              </li>
              <li>
                <Link to="/write" className="hover:text-indigo-600 dark:hover:text-indigo-400">Write an Article</Link>
              </li>
              <li>
                <Link to="/bookmarks" className="hover:text-indigo-600 dark:hover:text-indigo-400">Reading List</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Inkflow Blog Platform. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for full-stack excellence.
          </p>
        </div>
      </div>
    </footer>
  );
};
