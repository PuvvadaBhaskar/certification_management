import axios from "axios";

const BASE_URL = "http://localhost:2212/api";

export const getDashboard = (userId) => axios.get(`${BASE_URL}/dashboard/user/${userId}`);