import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { postApi } from '../api/postApi';
import { userApi } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import { CommentSection } from '../components/blog/CommentSection';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ReportModal } from '../components/common/ReportModal';
import toast from 'react-hot-toast';
import {
  Heart,
  Bookmark,
  MessageCircle,
  Eye,
  Clock,
  Calendar,
  Share2,
  Edit,
  Trash2,
  Flag,
  UserPlus,
  UserCheck,
  ArrowLeft,
} from 'lucide-react';

export const BlogDetailPage = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowingAuthor, setIsFollowingAuthor] = useState(false);
  const [authorFollowersCount, setAuthorFollowersCount] = useState(0);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await postApi.getPost(identifier);
      setPost(res.post);
      setLikesCount(res.post.likesCount || 0);
      setIsLiked(res.post.isLiked || false);
      setIsBookmarked(res.post.isBookmarked || false);
      setIsFollowingAuthor(res.post.isFollowingAuthor || false);
      setAuthorFollowersCount(res.post.author?.followersCount || 0);
    } catch (err) {
      toast.error('Post not found.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [identifier]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like posts.');
      return;
    }

    const prevLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await postApi.toggleLike(post._id);
      setIsLiked(res.liked);
      setLikesCount(res.likesCount);
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error('Failed to update like status.');
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save posts.');
      return;
    }

    const prevBookmarked = isBookmarked;
    setIsBookmarked(!prevBookmarked);

    try {
      const res = await postApi.toggleBookmark(post._id);
      setIsBookmarked(res.bookmarked);
      toast.success(res.message);
    } catch (err) {
      setIsBookmarked(prevBookmarked);
      toast.error('Failed to bookmark post.');
    }
  };

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to follow authors.');
      return;
    }

    if (post.author?._id === user?.id) return;

    try {
      const res = await userApi.toggleFollow(post.author._id);
      setIsFollowingAuthor(res.isFollowing);
      setAuthorFollowersCount(res.followersCount);
      toast.success(res.message);
    } catch (err) {
      toast.error('Failed to follow author.');
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to permanently delete this post?')) return;
    try {
      await postApi.deletePost(post._id);
      toast.success('Post deleted successfully.');
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete post.');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Article link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading story..." />
      </div>
    );
  }

  if (!post) return null;

  const isAuthor = user && post.author?._id === user.id;
  const canModify = isAuthor || isAdmin;

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to stories
        </Link>
      </div>

      {/* Category & Status */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          to={`/explore?category=${encodeURIComponent(post.category)}`}
          className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
        >
          {post.category}
        </Link>

        {post.status === 'draft' && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            Draft Preview
          </span>
        )}
      </div>

      {/* Article Title */}
      <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
        {post.title}
      </h1>

      {/* Author Bar & Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200 dark:border-slate-800 mb-8">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${post.author?.username}`}>
            <img
              src={post.author?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.name}`}
              alt={post.author?.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20"
            />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link
                to={`/profile/${post.author?.username}`}
                className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors"
              >
                {post.author?.name}
              </Link>

              {/* Follow Button */}
              {isAuthenticated && !isAuthor && (
                <button
                  onClick={handleToggleFollow}
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold transition-all ${
                    isFollowingAuthor
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isFollowingAuthor ? 'Following' : '+ Follow'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime || 1} min read
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {post.views || 0} views
              </span>
            </div>
          </div>
        </div>

        {/* Action icons bar */}
        <div className="flex items-center gap-2">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isLiked
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
            <span>{likesCount}</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-full transition-all ${
              isBookmarked
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Save post'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-indigo-600' : ''}`} />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Edit / Delete for Author or Admin */}
          {canModify && (
            <>
              <Link
                to={`/edit/${post._id}`}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 hover:text-indigo-600"
                title="Edit post"
              >
                <Edit className="w-4 h-4" />
              </Link>
              <button
                onClick={handleDeletePost}
                className="p-2 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100"
                title="Delete post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Report Button */}
          {isAuthenticated && !isAuthor && (
            <button
              onClick={() => setReportModalOpen(true)}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-slate-200"
              title="Report story"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="mb-10 rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 aspect-[16/9]">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Formatted Article Content */}
      <div
        className="prose-custom max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags Cloud */}
      {post.tags && post.tags.length > 0 && (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 mb-10">
          {post.tags.map((tag, idx) => (
            <Link
              key={idx}
              to={`/explore?tag=${encodeURIComponent(tag.replace('#', ''))}`}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* Author Bio Card at Bottom */}
      <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Link to={`/profile/${post.author?.username}`}>
          <img
            src={post.author?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.name}`}
            alt={post.author?.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-slate-800 shadow-md"
          />
        </Link>
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <Link
                to={`/profile/${post.author?.username}`}
                className="text-lg font-bold text-slate-900 dark:text-white hover:text-indigo-600"
              >
                {post.author?.name}
              </Link>
              <p className="text-xs text-slate-500">@{post.author?.username}</p>
            </div>

            {isAuthenticated && !isAuthor && (
              <button
                onClick={handleToggleFollow}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isFollowingAuthor
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                }`}
              >
                {isFollowingAuthor ? 'Following' : 'Follow Author'}
              </button>
            )}
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {post.author?.bio || 'Passionate author and tech storyteller.'}
          </p>

          <p className="text-xs text-slate-400">
            {authorFollowersCount} Followers
          </p>
        </div>
      </div>

      {/* Comments Section */}
      <CommentSection postId={post._id} postAuthorId={post.author?._id} />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        postId={post._id}
        title="Report Article"
      />
    </article>
  );
};
