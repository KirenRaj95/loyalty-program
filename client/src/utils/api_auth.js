import axiosInstance from "./axiosInstance";

export const registerUser = async (data) => {
  const response = await axiosInstance.post("/users/register", data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await axiosInstance.post("/users/login", data);
  return response.data;
};

export const logoutUser = async () => {
  const response = await axiosInstance.post("/users/logout");
  return response.data;
};
