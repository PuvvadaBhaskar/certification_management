import axios from "axios";

const BASE_URL = "http://localhost:2212/api";

// Send notification
export const sendNotification = async (data) => {
  const response = await axios.post(`${BASE_URL}/notifications`, data);
  return response.data;
};

// Get notifications
export const getUserNotifications = async (userId) => {
  const response = await axios.get(`${BASE_URL}/notifications/user/${userId}`);
  return response.data;
};

// Mark as read
export const markAsRead = async (id) => {
  const response = await axios.put(`${BASE_URL}/notifications/${id}/read`);
  return response.data;
};

// Delete notification
export const deleteNotification = async (id) => {
  const response = await axios.delete(`${BASE_URL}/notifications/${id}`);
  return response.data;
};