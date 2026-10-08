import mongoose from 'mongoose';
import slugify from 'slugify';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: [180, 'Title cannot exceed 180 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [320, 'Excerpt cannot exceed 320 characters'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'Technology',
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post author is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    viewedBy: [
      {
        type: String, // user ID or IP string to prevent repeated view abuse
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    commentsCount: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number,
      default: 1, // in minutes
    },
    trendingScore: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for likes count
postSchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

// Helper to calculate trending score
postSchema.methods.updateTrendingScore = function () {
  const likesCount = this.likes ? this.likes.length : 0;
  const commentsCount = this.commentsCount || 0;
  const views = this.views || 0;
  // Formula: likes * 3 + comments * 5 + views
  this.trendingScore = likesCount * 3 + commentsCount * 5 + views;
  return this.trendingScore;
};

// Pre-save hook for slug, excerpt, and read time
postSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    const baseSlug = slugify(this.title, { lower: true, strict: true, trim: true }) || 'post';
    this.slug = `${baseSlug}-${Date.now().toString(36)}`;
  }

  if (this.isModified('content')) {
    // Strip HTML tags for clean excerpt and word count calculation
    const plainText = this.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!this.excerpt) {
      this.excerpt = plainText.slice(0, 160) + (plainText.length > 160 ? '...' : '');
    }
    const words = plainText.split(/\s+/).filter(Boolean).length;
    this.readTime = Math.max(1, Math.ceil(words / 200));
  }

  this.updateTrendingScore();
  next();
});

// Index for search (title, excerpt, tags, category, content)
postSchema.index({
  title: 'text',
  excerpt: 'text',
  category: 'text',
  tags: 'text',
});

export const Post = mongoose.model('Post', postSchema);
