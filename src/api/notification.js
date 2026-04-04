import api from "./axios";

export const sendNotification = async (data) => {
  const response = await api.post("/notifications", data);
  return response.data;
};

export const getUserNotifications = async (userId) => {
  const response = await api.get(`/notifications/user/${userId}`);
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};
