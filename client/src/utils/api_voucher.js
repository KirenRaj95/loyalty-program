import axiosInstance from "./axiosInstance";

export const getMyVouchers = async (params = {}) => {
  const response = await axiosInstance.get("/vouchers", { params });
  return response.data;
};

export const getVoucherById = async (id) => {
  const response = await axiosInstance.get(`/vouchers/${id}`);
  return response.data;
};

export const redeemVoucher = async (id) => {
  const response = await axiosInstance.patch(`/vouchers/${id}/redeem`);
  return response.data;
};
