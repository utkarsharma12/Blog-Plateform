import api from './axios';

export const commentApi = {
  getComments: async (postId) => {
    const res = await api.get(`/comments/post/${postId}`);
    return res.data;
  },

  createComment: async (postId, { content, parentCommentId }) => {
    const res = await api.post(`/comments/post/${postId}`, { content, parentCommentId });
    return res.data;
  },

  deleteComment: async (commentId) => {
    const res = await api.delete(`/comments/${commentId}`);
    return res.data;
  },

  toggleLike: async (commentId) => {
    const res = await api.post(`/comments/${commentId}/like`);
    return res.data;
  },
};
