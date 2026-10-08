import api from './axios';

export const adminApi = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  getReports: async (status) => {
    const res = await api.get('/admin/reports', { params: { status } });
    return res.data;
  },

  updateReportStatus: async (id, status) => {
    const res = await api.put(`/admin/reports/${id}`, { status });
    return res.data;
  },

  getUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  createReport: async (reportData) => {
    const res = await api.post('/admin/reports', reportData);
    return res.data;
  },
};
