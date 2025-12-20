import axiosClient from "./axiosClient";

export const checkAvailability = (date, timeSlot, people = 2) => {
  return axiosClient.get(`/booking/availability`, {
    params: {
      date: date,
      timeSlot: timeSlot,
      people: people
    }
  });
};

export const createBooking = (data) => {
  return axiosClient.post("/booking/create", data);
};

export const getBookingHistory = () => {
  return axiosClient.get("/booking/user");
};

export const getBookedSlots = (date) => {
  return axiosClient.get("/booking/booked-slots", {
    params: {
      date: date
    }
  });
};