import axiosInstance from "./axiosInstance";

export const submitReceipt = async ({
  orderId,
  purchaseDate,
  amount,
  file,
}) => {
  const formData = new FormData();
  formData.append("orderId", orderId);
  formData.append("purchaseDate", purchaseDate);
  formData.append("amount", amount);
  formData.append("receipt", file);

  const response = await axiosInstance.post("/receipts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getMyReceipts = async (params = {}) => {
  const response = await axiosInstance.get("/receipts", { params });
  return response.data;
};

export const getReceiptById = async (id) => {
  const response = await axiosInstance.get(`/receipts/${id}`);
  return response.data;
};
