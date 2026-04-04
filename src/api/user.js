import api from "./axios";

export const createUser = async (data) => {
  const response = await api.post("/users", data);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    if (status !== 403 && status !== 404) {
      throw error;
    }

    // Fallback for backends that namespace admin-only delete endpoints.
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  }
};
