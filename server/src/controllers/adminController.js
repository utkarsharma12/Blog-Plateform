import { Report } from '../models/Report.js';
import { Post } from '../models/Post.js';
import { User } from '../models/User.js';
import { Comment } from '../models/Comment.js';

export const createReport = async (req, res) => {
  try {
    const { postId, commentId, reason, details } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Reason for report is required.' });
    }

    if (!postId && !commentId) {
      return res.status(400).json({ message: 'Must report either a post or a comment.' });
    }

    const report = await Report.create({
      reporter: req.user._id,
      post: postId || null,
      comment: commentId || null,
      reason,
      details: details || '',
    });

    return res.status(201).json({
      message: 'Report submitted successfully. Our moderation team will review it.',
      report,
    });
  } catch (err) {
    console.error('Create report error:', err);
    return res.status(500).json({ message: 'Failed to submit report.' });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const publishedPosts = await Post.countDocuments({ status: 'published' });
    const draftPosts = await Post.countDocuments({ status: 'draft' });
    const totalComments = await Comment.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    const viewsAgg = await Post.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } },
    ]);
    const totalViews = viewsAgg[0]?.totalViews || 0;

    return res.json({
      totalUsers,
      totalPosts,
      publishedPosts,
      draftPosts,
      totalComments,
      pendingReports,
      totalViews,
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ message: 'Failed to retrieve admin stats.' });
  }
};

export const getReports = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const reports = await Report.find(query)
      .populate('reporter', 'name username email')
      .populate({
        path: 'post',
        select: 'title slug excerpt author',
        populate: { path: 'author', select: 'name username' },
      })
      .populate({
        path: 'comment',
        select: 'content author post',
        populate: { path: 'author', select: 'name username' },
      })
      .sort({ createdAt: -1 });

    return res.json({ reports });
  } catch (err) {
    console.error('Get reports error:', err);
    return res.status(500).json({ message: 'Failed to retrieve reports.' });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid report status.' });
    }

    const report = await Report.findByIdAndUpdate(id, { status }, { new: true });
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    return res.json({ message: `Report marked as ${status}.`, report });
  } catch (err) {
    console.error('Update report error:', err);
    return res.status(500).json({ message: 'Failed to update report status.' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    return res.json({ users });
  } catch (err) {
    console.error('Get all users error:', err);
    return res.status(500).json({ message: 'Failed to retrieve users.' });
  }
};

export const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own admin account.' });
    }

    await User.findByIdAndDelete(id);
    await Post.deleteMany({ author: id });
    await Comment.deleteMany({ author: id });

    return res.json({ message: 'User and all associated data successfully removed.' });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ message: 'Failed to delete user.' });
  }
};
