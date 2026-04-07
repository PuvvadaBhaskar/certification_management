import axios from "axios";

const BASE_URL = "http://localhost:2212/api/notifications";

export const createNotification = async (data) => {
	const response = await axios.post(BASE_URL, data);
	return response.data;
};

export const createBulkNotification = async (data) => {
	const response = await axios.post(`${BASE_URL}/bulk`, data);
	return response.data;
};

export const getNotifications = async (userId) => {
	const response = await axios.get(`${BASE_URL}/user/${userId}`);
	return response.data;
};

export const getNotificationHistory = async (params = {}) => {
	const response = await axios.get(`${BASE_URL}/history`, { params });
	return response.data;
};

export const markAsRead = async (id) => {
	const response = await axios.put(`${BASE_URL}/${id}/read`);
	return response.data;
};

export const deleteNotification = async (id) => {
	const response = await axios.delete(`${BASE_URL}/${id}`);
	return response.data;
};