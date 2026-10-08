import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Notification } from '../models/Notification.js';

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const currentUserId = req.user ? req.user._id.toString() : null;
    const isFollowing = currentUserId
      ? user.followers.some((id) => id.toString() === currentUserId)
      : false;
    const isSelf = currentUserId === user._id.toString();

    // Calculate author stats
    const postsCount = await Post.countDocuments({ author: user._id, status: 'published' });
    const draftsCount = isSelf ? await Post.countDocuments({ author: user._id, status: 'draft' }) : 0;

    const statsAggregation = await Post.aggregate([
      { $match: { author: user._id, status: 'published' } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: { $size: '$likes' } },
        },
      },
    ]);

    const totalViews = statsAggregation[0]?.totalViews || 0;
    const totalLikes = statsAggregation[0]?.totalLikes || 0;

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        website: user.website,
        socialLinks: user.socialLinks,
        role: user.role,
        createdAt: user.createdAt,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        postsCount,
        draftsCount,
        totalViews,
        totalLikes,
        isFollowing,
        isSelf,
      },
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ message: 'Failed to retrieve profile.' });
  }
};

export const toggleFollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself.' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isFollowing = targetUser.followers.some((id) => id.toString() === currentUserId.toString());

    if (isFollowing) {
      // Unfollow
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== currentUserId.toString());
      currentUser.following = currentUser.following.filter((id) => id.toString() !== targetUserId.toString());
    } else {
      // Follow
      targetUser.followers.push(currentUserId);
      currentUser.following.push(targetUserId);

      // Create notification
      await Notification.create({
        recipient: targetUserId,
        sender: currentUserId,
        type: 'follow',
      });
    }

    await targetUser.save();
    await currentUser.save();

    return res.json({
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length,
      message: !isFollowing ? `You are now following @${targetUser.username}` : `Unfollowed @${targetUser.username}`,
    });
  } catch (err) {
    console.error('Toggle follow error:', err);
    return res.status(500).json({ message: 'Failed to toggle follow status.' });
  }
};

export const getUserFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate('followers', 'name username avatar bio');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({ followers: user.followers });
  } catch (err) {
    console.error('Get followers error:', err);
    return res.status(500).json({ message: 'Failed to retrieve followers.' });
  }
};

export const getUserFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate('following', 'name username avatar bio');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({ following: user.following });
  } catch (err) {
    console.error('Get following error:', err);
    return res.status(500).json({ message: 'Failed to retrieve following.' });
  }
};

export const getUserBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'bookmarks',
      populate: { path: 'author', select: 'name username avatar' },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const formattedBookmarks = (user.bookmarks || [])
      .filter((post) => post !== null)
      .map((post) => ({
        ...post.toObject(),
        likesCount: post.likes ? post.likes.length : 0,
        isLiked: post.likes ? post.likes.some((id) => id.toString() === req.user._id.toString()) : false,
        isBookmarked: true,
      }));

    return res.json({ bookmarks: formattedBookmarks });
  } catch (err) {
    console.error('Get bookmarks error:', err);
    return res.status(500).json({ message: 'Failed to retrieve bookmarks.' });
  }
};
