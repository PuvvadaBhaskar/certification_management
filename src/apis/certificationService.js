import api from "./api";

export const getCertifications = async (params = {}) => {
	const response = await api.get("/certifications", { params });
	return response.data.data.content;
};

export const getCertificationsByUser = async (userId) => {
	const response = await api.get(`/certifications/user/${userId}`);
	return response.data;
};

export const getCertificationById = async (id) => {
	const response = await api.get(`/certifications/${id}`);
	return response.data;
};

export const addCertification = async (data) => {
	const response = await api.post("/certifications", data);
	return response.data;
};

export const updateCertification = async (id, data) => {
	const response = await api.put(`/certifications/${id}`, data);
	return response.data;
};

export const deleteCertification = async (id) => {
	const response = await api.delete(`/certifications/${id}`);
	return response.data;
};