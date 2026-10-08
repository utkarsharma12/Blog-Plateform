import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationApi } from '../api/notificationApi';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  Bell,
  Heart,
  MessageSquare,
  Reply,
  UserPlus,
  CheckCheck,
  Clock,
} from 'lucide-react';

export const NotificationsPage = () => {
  const { setUnreadNotificationsCount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadNotificationsCount(res.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotificationsCount(0);
      toast.success('All notifications marked as read.');
    } catch (err) {
      toast.error('Failed to update notifications.');
    }
  };

  const renderIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case 'reply':
        return <Reply className="w-4 h-4 text-emerald-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-cyan-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Activity updates and interactions with your stories and comments.
            </p>
          </div>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
          <Bell className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            All caught up!
          </h3>
          <p className="text-xs text-slate-500">
            You don't have any new notifications at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const timeAgo = new Date(n.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={n._id}
                onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                  !n.isRead
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* User avatar with mini notification icon badge */}
                <div className="relative">
                  <Link to={`/profile/${n.sender?.username}`}>
                    <img
                      src={n.sender?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${n.sender?.name}`}
                      alt={n.sender?.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-800"
                    />
                  </Link>
                  <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-slate-900 shadow-sm">
                    {renderIcon(n.type)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 text-xs sm:text-sm">
                  <div className="text-slate-800 dark:text-slate-200">
                    <Link
                      to={`/profile/${n.sender?.username}`}
                      className="font-bold hover:text-indigo-600 mr-1"
                    >
                      {n.sender?.name}
                    </Link>

                    {n.type === 'like' && (
                      <span>
                        liked your story{' '}
                        {n.post && (
                          <Link to={`/blog/${n.post.slug || n.post._id}`} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                            "{n.post.title}"
                          </Link>
                        )}
                      </span>
                    )}

                    {n.type === 'comment' && (
                      <span>
                        commented on your story{' '}
                        {n.post && (
                          <Link to={`/blog/${n.post.slug || n.post._id}`} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                            "{n.post.title}"
                          </Link>
                        )}
                      </span>
                    )}

                    {n.type === 'reply' && (
                      <span>
                        replied to your comment on{' '}
                        {n.post && (
                          <Link to={`/blog/${n.post.slug || n.post._id}`} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                            "{n.post.title}"
                          </Link>
                        )}
                      </span>
                    )}

                    {n.type === 'follow' && <span>started following you.</span>}
                  </div>

                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {timeAgo}
                  </span>
                </div>

                {!n.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
