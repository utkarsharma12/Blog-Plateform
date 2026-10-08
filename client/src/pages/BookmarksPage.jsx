import React, { useState, useEffect } from 'react';
import { userApi } from '../api/userApi';
import { BlogCard } from '../components/blog/BlogCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Bookmark, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      const res = await userApi.getBookmarks();
      setBookmarks(res.bookmarks || []);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
          <Bookmark className="w-6 h-6 fill-indigo-600 dark:fill-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Saved Stories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Your personal reading library and bookmarked articles.
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading saved stories..." />
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            No saved stories yet
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Click the bookmark icon on any story to save it for later reading.
          </p>
          <Link
            to="/explore"
            className="inline-block px-5 py-2 text-xs font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Explore Stories
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((post) => (
            <BlogCard key={post._id} post={post} onPostUpdated={fetchBookmarks} />
          ))}
        </div>
      )}
    </div>
  );
};
