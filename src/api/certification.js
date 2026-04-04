import api from "./axios";

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
  return response.data;
};
