import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postApi } from '../../api/postApi';
import toast from 'react-hot-toast';
import {
  Heart,
  Bookmark,
  MessageCircle,
  Eye,
  Clock,
  Flag,
  Share2,
} from 'lucide-react';
import { ReportModal } from '../common/ReportModal';

export const BlogCard = ({ post, onPostUpdated }) => {
  const { user, isAuthenticated } = useAuth();
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please sign in to like posts.');
      return;
    }

    // Optimistic update
    const previousLiked = isLiked;
    const previousCount = likesCount;

    setIsLiked(!previousLiked);
    setLikesCount(previousLiked ? previousCount - 1 : previousCount + 1);

    try {
      const res = await postApi.toggleLike(post._id);
      setIsLiked(res.liked);
      setLikesCount(res.likesCount);
    } catch (err) {
      // Revert on error
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      toast.error('Failed to update like.');
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please sign in to save posts.');
      return;
    }

    const previousBookmarked = isBookmarked;
    setIsBookmarked(!previousBookmarked);

    try {
      const res = await postApi.toggleBookmark(post._id);
      setIsBookmarked(res.bookmarked);
      toast.success(res.message);
    } catch (err) {
      setIsBookmarked(previousBookmarked);
      toast.error('Failed to bookmark post.');
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/blog/${post.slug || post._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <>
      <article className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
        <div>
          {/* Cover Image */}
          {post.coverImage ? (
            <Link to={`/blog/${post.slug || post._id}`} className="block relative aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full bg-white/90 dark:bg-slate-900/90 text-indigo-600 dark:text-indigo-400 backdrop-blur-sm shadow-sm">
                {post.category}
              </span>
            </Link>
          ) : (
            <div className="pt-5 px-6">
              <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                {post.category}
              </span>
            </div>
          )}

          {/* Content Body */}
          <div className="p-5 sm:p-6">
            {/* Author Info */}
            <div className="flex items-center justify-between mb-3">
              <Link
                to={`/profile/${post.author?.username}`}
                className="flex items-center gap-2.5 group/author"
              >
                <img
                  src={post.author?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.name || 'User'}`}
                  alt={post.author?.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover/author:text-indigo-600 transition-colors">
                    {post.author?.name}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 ml-1.5">• {formattedDate}</span>
                </div>
              </Link>

              <div className="flex items-center text-xs text-slate-400 gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{post.readTime || 1} min read</span>
              </div>
            </div>

            {/* Title */}
            <Link to={`/blog/${post.slug || post._id}`}>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 transition-colors mb-2">
                {post.title}
              </h3>
            </Link>

            {/* Excerpt */}
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {post.tags.slice(0, 3).map((tag, idx) => (
                  <Link
                    key={idx}
                    to={`/explore?tag=${encodeURIComponent(tag.replace('#', ''))}`}
                    className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
          <div className="flex items-center gap-4">
            {/* Likes */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 hover:text-rose-600 transition-colors ${
                isLiked ? 'text-rose-600 font-semibold' : ''
              }`}
              title="Like post"
            >
              <Heart
                className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`}
              />
              <span>{likesCount}</span>
            </button>

            {/* Comments Count */}
            <Link
              to={`/blog/${post.slug || post._id}#comments`}
              className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
              title="Comments"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.commentsCount || 0}</span>
            </Link>

            {/* Views */}
            <div className="flex items-center gap-1 text-slate-400" title="Views">
              <Eye className="w-4 h-4" />
              <span>{post.views || 0}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded-lg hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                isBookmarked ? 'text-indigo-600 font-semibold' : ''
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Save post'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-indigo-600' : ''}`} />
            </button>

            {isAuthenticated && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setReportModalOpen(true);
                }}
                className="p-1.5 rounded-lg hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400"
                title="Report post"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </article>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        postId={post._id}
        title="Report Post"
      />
    </>
  );
};
