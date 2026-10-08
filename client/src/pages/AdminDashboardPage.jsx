import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { postApi } from '../api/postApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  ShieldAlert,
  Users,
  FileText,
  MessageCircle,
  Eye,
  Flag,
  CheckCircle,
  XCircle,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('reports'); // 'reports', 'users'
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getReports(),
        adminApi.getUsers(),
      ]);
      setStats(statsRes);
      setReports(reportsRes.reports || []);
      setAllUsers(usersRes.users || []);
    } catch (err) {
      toast.error('Failed to load admin moderation data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateReport = async (reportId, status) => {
    try {
      await adminApi.updateReportStatus(reportId, status);
      setReports((prev) =>
        prev.map((r) => (r._id === reportId ? { ...r, status } : r))
      );
      toast.success(`Report marked as ${status}.`);
    } catch (err) {
      toast.error('Failed to update report status.');
    }
  };

  const handleDeletePost = async (postId, reportId) => {
    if (!confirm('Are you sure you want to delete this flagged post?')) return;
    try {
      await postApi.deletePost(postId);
      if (reportId) {
        await adminApi.updateReportStatus(reportId, 'resolved');
      }
      toast.success('Flagged post removed.');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to remove post.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user and all their stories?')) return;
    try {
      await adminApi.deleteUser(userId);
      toast.success('User account removed.');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading admin control center..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Admin Moderation Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Platform statistics, content moderation, user management, and safety reports.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase text-slate-400">Users</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.totalUsers || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase text-slate-400">Published</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.publishedPosts || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase text-slate-400">Drafts</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.draftPosts || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-cyan-600 mb-1">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase text-slate-400">Comments</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.totalComments || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <Eye className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase text-slate-400">Total Views</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.totalViews || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-rose-600 mb-1">
            <Flag className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase text-slate-400">Reports</span>
          </div>
          <p className="text-2xl font-black text-rose-600">{stats?.pendingReports || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 mb-8 flex gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'reports'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Flag className="w-4 h-4" />
          Content Reports ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          User Management ({allUsers.length})
        </button>
      </div>

      {/* Reports Tab Content */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                All clear! No reports filed.
              </h3>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report._id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-rose-50 dark:bg-rose-950/40 text-rose-600">
                      {report.reason}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        report.status === 'pending'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                          : report.status === 'resolved'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {report.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      Reported by @{report.reporter?.username}
                    </span>
                  </div>

                  {report.post && (
                    <div className="text-sm">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Reported Story: </span>
                      <Link
                        to={`/blog/${report.post.slug || report.post._id}`}
                        target="_blank"
                        className="text-indigo-600 hover:underline font-medium inline-flex items-center gap-1"
                      >
                        {report.post.title}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                  {report.comment && (
                    <div className="text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-500 mb-1">
                        Reported Comment by @{report.comment.author?.username}:
                      </p>
                      <p className="italic text-slate-700 dark:text-slate-300">"{report.comment.content}"</p>
                    </div>
                  )}

                  {report.details && (
                    <p className="text-xs text-slate-500">
                      <strong>Notes:</strong> {report.details}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {report.post && (
                    <button
                      onClick={() => handleDeletePost(report.post._id, report._id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove Post
                    </button>
                  )}

                  {report.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateReport(report._id, 'resolved')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Resolve
                      </button>
                      <button
                        onClick={() => handleUpdateReport(report._id, 'dismissed')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Dismiss
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Users Tab Content */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Followers</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {allUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <Link
                          to={`/profile/${u.username}`}
                          className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600"
                        >
                          {u.name}
                        </Link>
                        <p className="text-xs text-slate-400">@{u.username}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.role === 'admin'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">{u.followers?.length || 0}</td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
