import axios from "axios";

const BASE_URL = "http://localhost:2212/api";

export const getUsers = () => axios.get(BASE_URL + "/users");

export const createUser = (data) => axios.post(BASE_URL + "/users", data);

export const getUserById = (id) => axios.get(`${BASE_URL}/users/${id}`);

export const deleteUserById = (id) => axios.delete(`${BASE_URL}/users/${id}`);
