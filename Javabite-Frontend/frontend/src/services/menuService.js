import axiosClient from "./axiosClient";

export const getMenu = () => {
  return axiosClient.get("/menu/all");
};