import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { userApi } from '../api/userApi';
import { postApi } from '../api/postApi';
import { useAuth } from '../context/AuthContext';
import { BlogCard } from '../components/blog/BlogCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EditProfileModal } from '../components/user/EditProfileModal';
import { UserListModal } from '../components/user/UserListModal';
import toast from 'react-hot-toast';
import {
  Globe,
  Calendar,
  Settings,
  BookOpen,
  FileText,
  Bookmark,
  Eye,
  Heart,
  Users,
} from 'lucide-react';
import { GithubIcon, TwitterIcon, LinkedinIcon } from '../components/common/SocialIcons';

export const ProfilePage = () => {
  const { username } = useParams();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'published';

  const { user: currentUser, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userListModal, setUserListModal] = useState({ open: false, title: '', users: [] });

  const fetchProfile = async () => {
    try {
      const res = await userApi.getProfile(username);
      setProfile(res.user);
    } catch (err) {
      toast.error('User not found.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTabPosts = async () => {
    if (!profile) return;
    setPostsLoading(true);
    try {
      if (activeTab === 'published') {
        const res = await postApi.getPosts({ author: profile.username, status: 'published' });
        setPosts(res.posts || []);
      } else if (activeTab === 'drafts' && profile.isSelf) {
        const res = await postApi.getPosts({ status: 'draft' });
        setPosts(res.posts || []);
      } else if (activeTab === 'saved' && profile.isSelf) {
        const res = await userApi.getBookmarks();
        setPosts(res.bookmarks || []);
      }
    } catch (err) {
      console.error('Failed to load posts for tab:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (profile) {
      fetchTabPosts();
    }
  }, [profile, activeTab]);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to follow authors.');
      return;
    }
    try {
      const res = await userApi.toggleFollow(profile.id);
      setProfile((prev) => ({
        ...prev,
        isFollowing: res.isFollowing,
        followersCount: res.followersCount,
      }));
      toast.success(res.message);
    } catch (err) {
      toast.error('Failed to update follow status.');
    }
  };

  const handleOpenFollowers = async () => {
    try {
      const res = await userApi.getFollowers(profile.id);
      setUserListModal({ open: true, title: 'Followers', users: res.followers || [] });
    } catch (err) {
      toast.error('Failed to load followers.');
    }
  };

  const handleOpenFollowing = async () => {
    try {
      const res = await userApi.getFollowing(profile.id);
      setUserListModal({ open: true, title: 'Following', users: res.following || [] });
    } catch (err) {
      toast.error('Failed to load following.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Loading author profile..." />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          <img
            src={profile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`}
            alt={profile.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-indigo-500/20 shadow-lg"
          />

          <div className="flex-1 text-center sm:text-left space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {profile.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-mono">@{profile.username}</p>
              </div>

              {/* Action Buttons */}
              <div>
                {profile.isSelf ? (
                  <button
                    onClick={() => setEditModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                ) : (
                  isAuthenticated && (
                    <button
                      onClick={handleToggleFollow}
                      className={`px-5 py-2 text-xs font-semibold rounded-full transition-all ${
                        profile.isFollowing
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20'
                      }`}
                    >
                      {profile.isFollowing ? 'Following' : 'Follow Author'}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Website & Socials */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{new URL(profile.website).hostname}</span>
                </a>
              )}
              {profile.socialLinks?.twitter && (
                <a
                  href={profile.socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-600 transition-colors"
                >
                  <TwitterIcon className="w-3.5 h-3.5" />
                </a>
              )}
              {profile.socialLinks?.github && (
                <a
                  href={profile.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-600 transition-colors"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                </a>
              )}
              {profile.socialLinks?.linkedin && (
                <a
                  href={profile.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-600 transition-colors"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 pt-3 text-xs border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {profile.postsCount}
                </span>{' '}
                <span className="text-slate-400">Stories</span>
              </div>

              <button onClick={handleOpenFollowers} className="hover:text-indigo-600">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {profile.followersCount}
                </span>{' '}
                <span className="text-slate-400">Followers</span>
              </button>

              <button onClick={handleOpenFollowing} className="hover:text-indigo-600">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {profile.followingCount}
                </span>{' '}
                <span className="text-slate-400">Following</span>
              </button>

              <div className="flex items-center gap-1 text-slate-400">
                <Eye className="w-3.5 h-3.5" />
                <span>{profile.totalViews} views</span>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>{profile.totalLikes} likes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 mb-8 flex gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('published')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'published'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Published ({profile.postsCount})
        </button>

        {profile.isSelf && (
          <>
            <button
              onClick={() => setActiveTab('drafts')}
              className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'drafts'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              Drafts ({profile.draftsCount || 0})
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'saved'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              Saved Stories
            </button>
          </>
        )}
      </div>

      {/* Tab Content */}
      {postsLoading ? (
        <LoadingSpinner text="Loading stories..." />
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-3">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No stories in this section
          </h3>
          <p className="text-xs text-slate-500">
            {activeTab === 'drafts'
              ? "You don't have any drafts right now."
              : activeTab === 'saved'
              ? "You haven't bookmarked any stories yet."
              : 'This author has not published any stories yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard key={post._id} post={post} onPostUpdated={fetchTabPosts} />
          ))}
        </div>
      )}

      {/* Modals */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onProfileUpdated={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
      />

      <UserListModal
        isOpen={userListModal.open}
        onClose={() => setUserListModal({ open: false, title: '', users: [] })}
        title={userListModal.title}
        users={userListModal.users}
      />
    </div>
  );
};
