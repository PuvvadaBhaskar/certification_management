import api from "./axios";

export const getDashboard = async (userId) => {
  const response = await api.get(`/dashboard/user/${userId}`);
  return response.data;
};
