import api from "./axios";

const normalizeCertCollection = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.content)) {
    return payload.data.content;
  }

  return [];
};

const normalizeCertEntity = (payload) => {
  if (Array.isArray(payload)) {
    return payload[0] || null;
  }

  if (payload?.data && !Array.isArray(payload.data)) {
    return payload.data;
  }

  return payload || null;
};

export const getCertifications = async (params = {}) => {
  const response = await api.get("/certifications", { params });
  return normalizeCertCollection(response.data);
};

export const addCertification = async (formData) => {
  const accessToken = localStorage.getItem("accessToken");

  const response = await api.post("/certifications", formData, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getCertificationsByUser = async (userId) => {
  const response = await api.get(`/certifications/user/${userId}`);
  return normalizeCertCollection(response.data);
};

export const getCertificationById = async (id) => {
  const response = await api.get(`/certifications/${id}`);
  return normalizeCertEntity(response.data);
};

export const updateCertification = async (id, data) => {
  const response = await api.put(`/certifications/${id}`, data);
  return response.data;
};

export const deleteCertification = async (id) => {
  const response = await api.delete(`/certifications/${id}`);
  return response.data;
};

export const renewCertification = async (id, newDate) => {
  const response = await api.put(`/certifications/${id}/renew`, null, {
    params: { newDate },
  });
  return response.data;
};

export const getAllCertifications = async (
  userId,
  page = 0,
  size = 10,
  sortBy = "id",
  search = "",
  status = ""
) => {
  const response = await api.get("/certifications", {
    params: {
      userId,
      page,
      size,
      sortBy,
      search,
      status,
    },
  });
  return normalizeCertCollection(response.data);
};
