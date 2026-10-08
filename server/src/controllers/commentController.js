import { Comment } from '../models/Comment.js';
import { Post } from '../models/Post.js';
import { Notification } from '../models/Notification.js';

export const getCommentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    const rawComments = await Comment.find({ post: postId })
      .populate('author', 'name username avatar')
      .sort({ createdAt: 1 });

    const currentUserId = req.user ? req.user._id.toString() : null;

    // Convert to plain objects with likes metadata
    const comments = rawComments.map((c) => ({
      ...c.toObject(),
      likesCount: c.likes.length,
      isLiked: currentUserId ? c.likes.some((uid) => uid.toString() === currentUserId) : false,
      replies: [],
    }));

    // Organize into hierarchical nested tree
    const commentMap = {};
    const rootComments = [];

    comments.forEach((c) => {
      commentMap[c._id.toString()] = c;
    });

    comments.forEach((c) => {
      if (c.parentComment) {
        const parentId = c.parentComment.toString();
        if (commentMap[parentId]) {
          commentMap[parentId].replies.push(c);
        } else {
          rootComments.push(c);
        }
      } else {
        rootComments.push(c);
      }
    });

    return res.json({ comments: rootComments, totalComments: comments.length });
  } catch (err) {
    console.error('Get comments error:', err);
    return res.status(500).json({ message: 'Failed to retrieve comments.' });
  }
};

export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content cannot be empty.' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    let parentComment = null;
    if (parentCommentId) {
      parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found.' });
      }
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      content: content.trim(),
      parentComment: parentComment ? parentComment._id : null,
    });

    await comment.populate('author', 'name username avatar');

    // Update post comments count and trending score
    post.commentsCount = (post.commentsCount || 0) + 1;
    post.updateTrendingScore();
    await post.save();

    // Notify post author if not commenting on own post
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        post: post._id,
        comment: comment._id,
      });
    }

    // Notify parent comment author if reply and not replying to self
    if (parentComment && parentComment.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: parentComment.author,
        sender: req.user._id,
        type: 'reply',
        post: post._id,
        comment: comment._id,
      });
    }

    return res.status(201).json({
      message: 'Comment posted successfully!',
      comment: {
        ...comment.toObject(),
        likesCount: 0,
        isLiked: false,
        replies: [],
      },
    });
  } catch (err) {
    console.error('Create comment error:', err);
    return res.status(500).json({ message: 'Failed to post comment.' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id).populate('post');

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    // Allow author of comment, author of post, or admin to delete
    const isCommentAuthor = comment.author.toString() === req.user._id.toString();
    const isPostAuthor = comment.post && comment.post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      return res.status(403).json({ message: 'You do not have permission to delete this comment.' });
    }

    // Delete comment and any direct replies
    const deletedReplies = await Comment.deleteMany({ parentComment: id });
    await Comment.findByIdAndDelete(id);

    // Update post count
    const post = await Post.findById(comment.post);
    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - (1 + deletedReplies.deletedCount));
      post.updateTrendingScore();
      await post.save();
    }

    return res.json({ message: 'Comment removed successfully.' });
  } catch (err) {
    console.error('Delete comment error:', err);
    return res.status(500).json({ message: 'Failed to delete comment.' });
  }
};

export const toggleLikeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    const alreadyLiked = comment.likes.some((uid) => uid.toString() === userId.toString());

    if (alreadyLiked) {
      comment.likes = comment.likes.filter((uid) => uid.toString() !== userId.toString());
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    return res.json({
      liked: !alreadyLiked,
      likesCount: comment.likes.length,
    });
  } catch (err) {
    console.error('Toggle like comment error:', err);
    return res.status(500).json({ message: 'Failed to like comment.' });
  }
};
