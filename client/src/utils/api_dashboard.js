import axiosInstance from "./axiosInstance";

export const getUserDashboard = async () => {
  const response = await axiosInstance.get("/dashboard");
  return response.data;
};

export const getAdminDashboard = async () => {
  const response = await axiosInstance.get("/admin/dashboard");
  return response.data;
};
