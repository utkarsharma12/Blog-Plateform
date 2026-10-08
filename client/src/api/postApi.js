import api from './axios';

export const postApi = {
  getPosts: async (params = {}) => {
    const res = await api.get('/posts', { params });
    return res.data;
  },

  getFollowingFeed: async (params = {}) => {
    const res = await api.get('/posts/following', { params });
    return res.data;
  },

  getTrendingPosts: async (limit = 5) => {
    const res = await api.get('/posts/trending', { params: { limit } });
    return res.data;
  },

  getPost: async (identifier) => {
    const res = await api.get(`/posts/${identifier}`);
    return res.data;
  },

  createPost: async (postData) => {
    const res = await api.post('/posts', postData);
    return res.data;
  },

  updatePost: async (id, postData) => {
    const res = await api.put(`/posts/${id}`, postData);
    return res.data;
  },

  deletePost: async (id) => {
    const res = await api.delete(`/posts/${id}`);
    return res.data;
  },

  toggleLike: async (id) => {
    const res = await api.post(`/posts/${id}/like`);
    return res.data;
  },

  toggleBookmark: async (id) => {
    const res = await api.post(`/posts/${id}/bookmark`);
    return res.data;
  },

  getCategoriesAndTags: async () => {
    const res = await api.get('/posts/meta/categories-tags');
    return res.data;
  },
};
