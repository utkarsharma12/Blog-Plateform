import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { commentApi } from '../../api/commentApi';
import toast from 'react-hot-toast';
import {
  Heart,
  Reply,
  Trash2,
  Flag,
  Send,
  CornerDownRight,
} from 'lucide-react';
import { ReportModal } from '../common/ReportModal';

export const CommentItem = ({
  comment,
  postId,
  postAuthorId,
  onCommentDeleted,
  onReplyAdded,
}) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const isCommentAuthor = user && comment.author?._id === user.id;
  const isPostAuthor = user && postAuthorId === user.id;
  const canDelete = isCommentAuthor || isPostAuthor || isAdmin;

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like comments.');
      return;
    }

    const prevLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await commentApi.toggleLike(comment._id);
      setIsLiked(res.liked);
      setLikesCount(res.likesCount);
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error('Failed to like comment.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await commentApi.deleteComment(comment._id);
      toast.success('Comment deleted.');
      if (onCommentDeleted) onCommentDeleted(comment._id);
    } catch (err) {
      toast.error('Failed to delete comment.');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    if (!isAuthenticated) {
      toast.error('Please sign in to reply.');
      return;
    }

    setSubmittingReply(true);
    try {
      const res = await commentApi.createComment(postId, {
        content: replyContent.trim(),
        parentCommentId: comment._id,
      });
      toast.success('Reply posted!');
      setReplyContent('');
      setShowReplyBox(false);
      if (onReplyAdded) onReplyAdded(res.comment, comment._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const formattedDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="relative">
      <div className="flex gap-3 text-sm">
        {/* Author Avatar */}
        <Link to={`/profile/${comment.author?.username}`}>
          <img
            src={comment.author?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.author?.name}`}
            alt={comment.author?.name}
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-800"
          />
        </Link>

        <div className="flex-1">
          {/* Comment Bubble */}
          <div className="bg-slate-100 dark:bg-slate-800/70 rounded-2xl px-4 py-3 border border-slate-200/50 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <Link
                to={`/profile/${comment.author?.username}`}
                className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 transition-colors"
              >
                {comment.author?.name}
                <span className="text-xs text-slate-400 font-normal ml-2">
                  @{comment.author?.username} • {formattedDate}
                </span>
              </Link>

              {/* Actions dropdown or delete button */}
              <div className="flex items-center gap-1">
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Delete comment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {isAuthenticated && !isCommentAuthor && (
                  <button
                    onClick={() => setReportModalOpen(true)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Report comment"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line text-sm">
              {comment.content}
            </p>
          </div>

          {/* Comment actions: Like & Reply */}
          <div className="flex items-center gap-4 mt-1.5 px-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 hover:text-rose-600 transition-colors ${
                isLiked ? 'text-rose-600 font-semibold' : ''
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600' : ''}`} />
              <span>{likesCount > 0 ? likesCount : 'Like'}</span>
            </button>

            <button
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
            >
              <Reply className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          </div>

          {/* Reply Input Form */}
          {showReplyBox && (
            <form onSubmit={handleSendReply} className="mt-3 flex gap-2 animate-in fade-in duration-100">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Replying to @${comment.author?.username}...`}
                className="flex-1 px-3.5 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={submittingReply || !replyContent.trim()}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                Reply
              </button>
              <button
                type="button"
                onClick={() => setShowReplyBox(false)}
                className="px-2.5 py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Nested Replies Rendering */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 pl-4 border-l-2 border-indigo-100 dark:border-indigo-950/60 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  postId={postId}
                  postAuthorId={postAuthorId}
                  onCommentDeleted={onCommentDeleted}
                  onReplyAdded={onReplyAdded}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        commentId={comment._id}
        title="Report Comment"
      />
    </div>
  );
};
