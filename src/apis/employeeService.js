import axios from "axios";

const BASE_URL =  "http://localhost:2212/api";

// GET all employees
export const getEmployees = () => axios.get(BASE_URL + "/getAllEmp");

// ADD employee
export const addEmployee = (emp) => axios.post(BASE_URL + "/saveEmp", emp);

// UPDATE employee
export const updateEmployee = (id, emp) => axios.put(`${BASE_URL}/updateEmp/${id}`, emp);

// DELETE employee
export const deleteEmployee = (id) => axios.delete(`${BASE_URL}/deleteEmp/${id}`);

// GET employee by ID
export const getEmployeeById = (id) => axios.get(`${BASE_URL}/getEmp/${id}`);
