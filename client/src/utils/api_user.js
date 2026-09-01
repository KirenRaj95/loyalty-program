import axiosInstance from "./axiosInstance";

export const getProfile = async () => {
  const response = await axiosInstance.get("/users/profile");
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await axiosInstance.put("/users/profile", data);
  return response.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await axiosInstance.post("/users/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
