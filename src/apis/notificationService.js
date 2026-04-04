import axios from "axios";

const BASE_URL = "http://localhost:2212/api/notifications";

const buildMessage = (data) =>
	data?.title
		? `${String(data.title).trim()}: ${String(data.message || "").trim()}`
		: String(data?.message || "").trim();

export const getNotifications = async (userId) => {
	if (!userId) {
		return { data: [] };
	}

	const response = await axios.get(`${BASE_URL}/user/${userId}`);
	return {
		...response,
		data: Array.isArray(response?.data) ? response.data : [],
	};
};

export const sendNotification = async (data) => {
	const recipientIds = Array.isArray(data?.recipientIds)
		? data.recipientIds
		: Array.isArray(data?.userIds)
			? data.userIds
			: [];

	if (recipientIds.length === 0) {
		throw new Error("At least one recipient is required");
	}

	const finalMessage = buildMessage(data);
	const sendEmail = Boolean(data?.sendEmail);
	const channel = data?.channel || (sendEmail ? "email" : "in_app");

	for (const userId of recipientIds) {
		await axios.post(BASE_URL, {
			userId,
			title: String(data?.title || "").trim(),
			message: finalMessage,
			senderId: data?.senderId,
			sendEmail,
			channel,
		});
	}

	return { data: { success: true } };
};

export const sendEmailNotification = async (data) => {
	const payload = {
		...data,
		sendEmail: true,
		channel: "email",
	};

	return sendNotification(payload);
};

export const markAsRead = (id) => axios.put(`${BASE_URL}/${id}/read`);

export const deleteNotification = (id) => axios.delete(`${BASE_URL}/${id}`);