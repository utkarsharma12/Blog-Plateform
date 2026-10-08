import { Notification } from '../models/Notification.js';

export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name username avatar')
      .populate('post', 'title slug')
      .populate('comment', 'content')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    return res.json({ notifications, unreadCount });
  } catch (err) {
    console.error('Get notifications error:', err);
    return res.status(500).json({ message: 'Failed to retrieve notifications.' });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    return res.json({ message: 'Notification marked as read.', notification });
  } catch (err) {
    console.error('Mark notification read error:', err);
    return res.status(500).json({ message: 'Failed to update notification.' });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    return res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('Mark all read error:', err);
    return res.status(500).json({ message: 'Failed to update notifications.' });
  }
};
