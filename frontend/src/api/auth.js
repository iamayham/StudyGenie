import api from "./client";

export const registerUser = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};

export const loginUser = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data;
};

export const sendForgotPasswordOtp = async (payload) => {
  const { data } = await api.post("/auth/forgot-password", payload);
  return data;
};

export const resetPasswordWithOtp = async (payload) => {
  const { data } = await api.post("/auth/reset-password-otp", payload);
  return data;
};
