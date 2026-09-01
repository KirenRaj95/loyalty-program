import axiosInstance from "./axiosInstance";

export const getAllReceipts = async (params = {}) => {
  const response = await axiosInstance.get("/admin/receipts", { params });
  return response.data;
};

export const getAdminReceiptDetails = async (id) => {
  const response = await axiosInstance.get(`/admin/receipts/${id}`);
  return response.data;
};

export const approveReceipt = async (id) => {
  const response = await axiosInstance.patch(`/admin/receipts/${id}/approve`);
  return response.data;
};

export const rejectReceipt = async (id, reason) => {
  const response = await axiosInstance.patch(`/admin/receipts/${id}/reject`, {
    reason,
  });
  return response.data;
};
