import { Post } from '../models/Post.js';
import { User } from '../models/User.js';
import { Comment } from '../models/Comment.js';
import { Notification } from '../models/Notification.js';

export const getPosts = async (req, res) => {
  try {
    const {
      search,
      category,
      tag,
      author,
      status = 'published',
      sort = 'latest',
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    // Only author or admin can see drafts
    if (status === 'draft') {
      if (!req.user) {
        return res.status(401).json({ message: 'Must be logged in to view drafts.' });
      }
      query.status = 'draft';
      query.author = req.user._id;
    } else if (status === 'all') {
      if (req.user && req.user.role === 'admin') {
        // Admin can see all
      } else if (req.user) {
        query.$or = [{ status: 'published' }, { author: req.user._id }];
      } else {
        query.status = 'published';
      }
    } else {
      query.status = 'published';
    }

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (tag) {
      const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
      query.tags = { $in: [tag, cleanTag] };
    }

    if (author) {
      const authorUser = await User.findOne({
        $or: [{ username: author.toLowerCase() }, { _id: author.match(/^[0-9a-fA-F]{24}$/) ? author : null }],
      });
      if (authorUser) {
        query.author = authorUser._id;
      } else {
        return res.json({ posts: [], totalPosts: 0, totalPages: 0, currentPage: Number(page) });
      }
    }

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { excerpt: regex },
        { category: regex },
        { tags: regex },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'trending') {
      sortOption = { trendingScore: -1, createdAt: -1 };
    } else if (sort === 'popular') {
      sortOption = { views: -1, createdAt: -1 };
    } else if (sort === 'top') {
      sortOption = { 'likes.length': -1, createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const totalPosts = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name username avatar bio')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    // Map posts to include isLiked and isBookmarked for the request user
    const formattedPosts = posts.map((post) => {
      const isLiked = req.user ? post.likes.some((id) => id.toString() === req.user._id.toString()) : false;
      const isBookmarked = req.user ? req.user.bookmarks.some((id) => id.toString() === post._id.toString()) : false;
      return {
        ...post.toObject(),
        likesCount: post.likes.length,
        isLiked,
        isBookmarked,
      };
    });

    return res.json({
      posts: formattedPosts,
      totalPosts,
      totalPages: Math.ceil(totalPosts / Number(limit)),
      currentPage: Number(page),
    });
  } catch (err) {
    console.error('Get posts error:', err);
    return res.status(500).json({ message: 'Failed to retrieve posts.' });
  }
};

export const getFollowingFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.following || user.following.length === 0) {
      return res.json({ posts: [], totalPosts: 0, totalPages: 0 });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = {
      author: { $in: user.following },
      status: 'published',
    };

    const totalPosts = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name username avatar bio')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const formattedPosts = posts.map((post) => ({
      ...post.toObject(),
      likesCount: post.likes.length,
      isLiked: post.likes.some((id) => id.toString() === req.user._id.toString()),
      isBookmarked: user.bookmarks.some((id) => id.toString() === post._id.toString()),
    }));

    return res.json({
      posts: formattedPosts,
      totalPosts,
      totalPages: Math.ceil(totalPosts / Number(limit)),
      currentPage: Number(page),
    });
  } catch (err) {
    console.error('Get following feed error:', err);
    return res.status(500).json({ message: 'Failed to retrieve following feed.' });
  }
};

export const getTrendingPosts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name username avatar')
      .sort({ trendingScore: -1, createdAt: -1 })
      .limit(limit);

    return res.json({
      posts: posts.map((post) => ({
        ...post.toObject(),
        likesCount: post.likes.length,
        isLiked: req.user ? post.likes.some((id) => id.toString() === req.user._id.toString()) : false,
      })),
    });
  } catch (err) {
    console.error('Get trending posts error:', err);
    return res.status(500).json({ message: 'Failed to retrieve trending posts.' });
  }
};

export const getPostBySlugOrId = async (req, res) => {
  try {
    const { identifier } = req.params;

    const query = identifier.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: identifier }
      : { slug: identifier };

    const post = await Post.findOne(query).populate('author', 'name username avatar bio followers following');

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // If draft, only author or admin can view
    if (post.status === 'draft') {
      if (!req.user || (post.author._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
        return res.status(403).json({ message: 'You do not have permission to view this draft.' });
      }
    } else {
      // Increment views with basic spam protection
      const viewerId = req.user ? req.user._id.toString() : (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'anonymous');
      if (!post.viewedBy.includes(viewerId)) {
        post.viewedBy.push(viewerId);
        post.views += 1;
        post.updateTrendingScore();
        await post.save();
      }
    }

    const isLiked = req.user ? post.likes.some((id) => id.toString() === req.user._id.toString()) : false;
    let isBookmarked = false;
    let isFollowingAuthor = false;

    if (req.user) {
      const currentUser = await User.findById(req.user._id);
      if (currentUser) {
        isBookmarked = currentUser.bookmarks.some((id) => id.toString() === post._id.toString());
        isFollowingAuthor = currentUser.following.some((id) => id.toString() === post.author._id.toString());
      }
    }

    return res.json({
      post: {
        ...post.toObject(),
        likesCount: post.likes.length,
        isLiked,
        isBookmarked,
        isFollowingAuthor,
        author: {
          ...post.author.toObject(),
          followersCount: post.author.followers.length,
          followingCount: post.author.following.length,
        },
      },
    });
  } catch (err) {
    console.error('Get post error:', err);
    return res.status(500).json({ message: 'Failed to retrieve post.' });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, content, coverImage, category, tags, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const formattedTags = Array.isArray(tags)
      ? tags.map((t) => (t.startsWith('#') ? t : `#${t.trim()}`))
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean).map((t) => (t.startsWith('#') ? t : `#${t}`))
      : [];

    const post = new Post({
      title: title.trim(),
      content,
      coverImage: coverImage || '',
      category: category || 'Technology',
      tags: formattedTags,
      status: status === 'draft' ? 'draft' : 'published',
      author: req.user._id,
    });

    await post.save();
    await post.populate('author', 'name username avatar bio');

    return res.status(201).json({
      message: post.status === 'draft' ? 'Draft saved successfully!' : 'Post published successfully!',
      post,
    });
  } catch (err) {
    console.error('Create post error:', err);
    return res.status(500).json({ message: err.message || 'Failed to create post.' });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, coverImage, category, tags, status } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Only author or admin can update
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to edit this post.' });
    }

    if (title) post.title = title.trim();
    if (content) post.content = content;
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (category) post.category = category;
    if (status) post.status = status;
    if (tags) {
      post.tags = Array.isArray(tags)
        ? tags.map((t) => (t.startsWith('#') ? t : `#${t.trim()}`))
        : tags.split(',').map((t) => t.trim()).filter(Boolean).map((t) => (t.startsWith('#') ? t : `#${t}`));
    }

    post.updateTrendingScore();
    await post.save();
    await post.populate('author', 'name username avatar bio');

    return res.json({
      message: 'Post updated successfully!',
      post,
    });
  } catch (err) {
    console.error('Update post error:', err);
    return res.status(500).json({ message: 'Failed to update post.' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to delete this post.' });
    }

    await Post.findByIdAndDelete(id);
    await Comment.deleteMany({ post: id });
    await Notification.deleteMany({ post: id });

    return res.json({ message: 'Post deleted successfully!' });
  } catch (err) {
    console.error('Delete post error:', err);
    return res.status(500).json({ message: 'Failed to delete post.' });
  }
};

export const toggleLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const alreadyLiked = post.likes.some((uid) => uid.toString() === userId.toString());

    if (alreadyLiked) {
      post.likes = post.likes.filter((uid) => uid.toString() !== userId.toString());
    } else {
      post.likes.push(userId);

      // Create notification if liking someone else's post
      if (post.author.toString() !== userId.toString()) {
        await Notification.create({
          recipient: post.author,
          sender: userId,
          type: 'like',
          post: post._id,
        });
      }
    }

    post.updateTrendingScore();
    await post.save();

    return res.json({
      liked: !alreadyLiked,
      likesCount: post.likes.length,
    });
  } catch (err) {
    console.error('Toggle like error:', err);
    return res.status(500).json({ message: 'Failed to update like status.' });
  }
};

export const toggleBookmarkPost = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const isBookmarked = user.bookmarks.some((bId) => bId.toString() === id.toString());

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter((bId) => bId.toString() !== id.toString());
    } else {
      user.bookmarks.push(post._id);
    }

    await user.save();

    return res.json({
      bookmarked: !isBookmarked,
      bookmarksCount: user.bookmarks.length,
      message: !isBookmarked ? 'Post saved to bookmarks' : 'Post removed from bookmarks',
    });
  } catch (err) {
    console.error('Toggle bookmark error:', err);
    return res.status(500).json({ message: 'Failed to bookmark post.' });
  }
};

export const getCategoriesAndTags = async (req, res) => {
  try {
    const categoriesAggregation = await Post.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const tagsAggregation = await Post.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    const predefinedCategories = [
      'Technology',
      'Artificial Intelligence',
      'Programming',
      'Web Development',
      'Data Science',
      'Cybersecurity',
      'Gaming',
      'Education',
    ];

    const categoryCounts = {};
    categoriesAggregation.forEach((c) => {
      if (c._id) categoryCounts[c._id] = c.count;
    });

    const categories = predefinedCategories.map((name) => ({
      name,
      count: categoryCounts[name] || 0,
    }));

    const tags = tagsAggregation.map((t) => ({
      name: t._id,
      count: t.count,
    }));

    return res.json({ categories, tags });
  } catch (err) {
    console.error('Get categories & tags error:', err);
    return res.status(500).json({ message: 'Failed to retrieve categories and tags.' });
  }
};
