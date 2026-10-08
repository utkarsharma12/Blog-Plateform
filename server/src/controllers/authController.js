import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'super_secret_blog_platform_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const register = async (req, res) => {
  try {
    const { name, username, email, password, confirmPassword } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const cleanedUsername = username.trim().toLowerCase();
    const cleanedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: cleanedEmail }, { username: cleanedUsername }],
    });

    if (existingUser) {
      if (existingUser.email === cleanedEmail) {
        return res.status(400).json({ message: 'An account with this email already exists.' });
      }
      return res.status(400).json({ message: 'This username is already taken. Please choose another.' });
    }

    // Default avatar
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0ea5e9,6366f1,8b5cf6`;

    const user = await User.create({
      name: name.trim(),
      username: cleanedUsername,
      email: cleanedEmail,
      password,
      avatar,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        followersCount: 0,
        followingCount: 0,
        bookmarks: [],
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: err.message || 'Server error during registration.' });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or username

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide your email/username and password.' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    const user = await User.findOne({
      $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    const token = generateToken(user._id);

    return res.json({
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        website: user.website,
        socialLinks: user.socialLinks,
        role: user.role,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        bookmarks: user.bookmarks,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', 'name username avatar')
      .populate('following', 'name username avatar');

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        website: user.website,
        socialLinks: user.socialLinks,
        role: user.role,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        followers: user.followers,
        following: user.following,
        bookmarks: user.bookmarks,
      },
    });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ message: 'Failed to fetch current user profile.' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, bio, website, avatar, socialLinks } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio;
    if (website !== undefined) user.website = website;
    if (avatar) user.avatar = avatar;
    if (socialLinks) {
      user.socialLinks = {
        twitter: socialLinks.twitter || user.socialLinks.twitter,
        github: socialLinks.github || user.socialLinks.github,
        linkedin: socialLinks.linkedin || user.socialLinks.linkedin,
      };
    }

    await user.save();

    return res.json({
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        website: user.website,
        socialLinks: user.socialLinks,
        role: user.role,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        bookmarks: user.bookmarks,
      },
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
};
