import axiosClient from "./axiosClient";

export const sendStaffInvite = async ({ name, email, role }) => {
  return axiosClient.post("/api/admin/staff/invite", {
    name,
    email,
    role: role.toUpperCase(), // CHEF or WAITER
  });
};

export const getStaffInvites = async () => {
  return axiosClient.get("/api/admin/staff/invites");
};
