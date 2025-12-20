import axiosClient from "./axiosClient";

export const inviteStaff = async (data) => {
  return axiosClient.post("/api/admin/staff/invite", data);
};

export const getInvites = async () => {
  return axiosClient.get("/api/admin/staff/invites");
};
