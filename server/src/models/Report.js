import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
      index: true,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    reason: {
      type: String,
      required: [true, 'Reason for report is required'],
      enum: ['spam', 'harassment', 'inappropriate', 'hate_speech', 'misinformation', 'other'],
      default: 'inappropriate',
    },
    details: {
      type: String,
      default: '',
      maxlength: [500, 'Details cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Report = mongoose.model('Report', reportSchema);
