import api from "./api";

// GET certifications with fallback endpoint support.
export const getCertifications = async (params = {}) => {
	const { userId, ...rest } = params;

	if (userId) {
		try {
			return await api.get(`/certifications/user/${userId}`, {
				params: rest,
			});
		} catch (error) {
			// Fallback for backends that expose a generic list endpoint.
			if (error?.response?.status !== 404) {
				throw error;
			}
		}
	}

	return api.get("/certifications", { params });
};

export const getCertificationById = async (id, userId) => {
	try {
		return await api.get(`/certifications/${id}`);
	} catch (error) {
		if (error?.response?.status !== 404 || !userId) {
			throw error;
		}

		// Fallback for APIs that only support list-by-user.
		return getCertifications({ userId });
	}
};

export const addCertification = (data) => api.post("/certifications", data);

export const updateCertification = (id, data) =>
	api.put(`/certifications/${id}`, data);

export const deleteCertification = (id) => api.delete(`/certifications/${id}`);