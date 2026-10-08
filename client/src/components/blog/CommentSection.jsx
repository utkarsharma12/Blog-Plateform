import React, { useState, useEffect } from 'react';
import { commentApi } from '../../api/commentApi';
import { useAuth } from '../../context/AuthContext';
import { CommentItem } from './CommentItem';
import { LoadingSpinner } from '../common/LoadingSpinner';
import toast from 'react-hot-toast';
import { MessageSquare, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CommentSection = ({ postId, postAuthorId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await commentApi.getComments(postId);
      setComments(res.comments || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      toast.error('Please sign in to leave a comment.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await commentApi.createComment(postId, { content: newComment.trim() });
      toast.success('Comment posted!');
      setNewComment('');
      // Prepend to top level comments
      setComments((prev) => [res.comment, ...prev]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentDeleted = (deletedId) => {
    // Recursively filter deleted comment or reply
    const filterComments = (list) => {
      return list
        .filter((c) => c._id !== deletedId)
        .map((c) => ({
          ...c,
          replies: c.replies ? filterComments(c.replies) : [],
        }));
    };
    setComments((prev) => filterComments(prev));
  };

  const handleReplyAdded = (newReply, parentId) => {
    const appendReply = (list) => {
      return list.map((c) => {
        if (c._id === parentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newReply],
          };
        }
        if (c.replies && c.replies.length > 0) {
          return {
            ...c,
            replies: appendReply(c.replies),
          };
        }
        return c;
      });
    };
    setComments((prev) => appendReply(prev));
  };

  return (
    <section id="comments" className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Discussions
        </h3>
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          {comments.length}
        </span>
      </div>

      {/* Main Comment Box */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex gap-3">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-800"
            />
            <div className="flex-1">
              <textarea
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What are your thoughts on this story? Leave a comment..."
                className="w-full px-4 py-3 text-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none shadow-sm"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Posting...' : 'Publish Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Join the conversation and share your perspective.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
          >
            Sign in to Comment
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <LoadingSpinner text="Loading discussions..." />
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postId={postId}
              postAuthorId={postAuthorId}
              onCommentDeleted={handleCommentDeleted}
              onReplyAdded={handleReplyAdded}
            />
          ))}
        </div>
      )}
    </section>
  );
};
