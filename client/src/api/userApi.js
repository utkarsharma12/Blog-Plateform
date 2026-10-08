import api from './axios';

export const userApi = {
  getProfile: async (username) => {
    const res = await api.get(`/users/${username}`);
    return res.data;
  },

  toggleFollow: async (userId) => {
    const res = await api.post(`/users/${userId}/follow`);
    return res.data;
  },

  getFollowers: async (userId) => {
    const res = await api.get(`/users/${userId}/followers`);
    return res.data;
  },

  getFollowing: async (userId) => {
    const res = await api.get(`/users/${userId}/following`);
    return res.data;
  },

  getBookmarks: async () => {
    const res = await api.get('/users/bookmarks');
    return res.data;
  },
};
