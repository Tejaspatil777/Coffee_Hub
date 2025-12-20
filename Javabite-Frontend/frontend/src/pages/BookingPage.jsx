import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";
import DatePicker from "../components/DatePicker";
import TimeSlotSelector from "../components/TimeSlotSelector";
import PeopleCounter from "../components/PeopleCounter";
import SuccessModal from "../components/SuccessModal";
import { checkAvailability, createBooking, getBookedSlots } from "../services/bookingService";

function BookingPage() {
  const [disabledSlots, setDisabledSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [peopleCount, setPeopleCount] = useState(2);
  const [availability, setAvailability] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Convert DD-MM-YYYY → YYYY-MM-DD for backend
  const convertDate = (dateStr) => {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`;
  };

  // ---------- FETCH BOOKED SLOTS ----------
  useEffect(() => {
    if (!selectedDate) return;

    const backendDate = convertDate(selectedDate);
    
    getBookedSlots(backendDate)
      .then(res => {
        setDisabledSlots(res.data.bookedSlots || []);
      })
      .catch(err => {
        console.error("Error fetching booked slots:", err);
        setDisabledSlots([]);
      });
  }, [selectedDate]);

  // ---------- CHECK AVAILABILITY ----------
  const handleCheckAvailability = async () => {
    if (!selectedDate || !selectedTimeSlot) return;

    setIsChecking(true);
    setAvailability(null);

    try {
      const backendDate = convertDate(selectedDate);
      
      const res = await checkAvailability(backendDate, selectedTimeSlot, peopleCount);

      setAvailability(res.data.available);
    } catch (err) {
      console.error("Availability check error:", err);
      setAvailability(false);
    }

    setIsChecking(false);
  };

  // ---------- BOOK NOW ----------
  const handleBookNow = async () => {
    try {
      const backendDate = convertDate(selectedDate);
      
      await createBooking({
        date: backendDate,
        timeSlot: selectedTimeSlot,
        numberOfPeople: peopleCount,
      });

      setShowSuccessModal(true);
      
      // Refresh booked slots after successful booking
      const res = await getBookedSlots(backendDate);
      setDisabledSlots(res.data.bookedSlots || []);
      
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setSelectedDate("");
    setSelectedTimeSlot("");
    setPeopleCount(2);
    setAvailability(null);
    setDisabledSlots([]);
  };

  const isFormValid = selectedDate && selectedTimeSlot;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background animation */}
      <motion.div
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-amber-950"
        style={{ backgroundSize: "200% 200%" }}
      />

      {/* Background image */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1920')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(3px)",
        }}
      />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-2xl"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-bold text-white mb-3">
              Reserve Your Table
            </h1>
            <p className="text-amber-100 text-lg">
              Experience the perfect blend of ambiance and flavor
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white border-opacity-20"
          >
            <div className="space-y-6">
              {/* Date Picker */}
              <DatePicker
                selectedDate={selectedDate}
                onChange={(d) => setSelectedDate(d)}
              />

              {/* Time Slot Selector */}
              <TimeSlotSelector
                selectedSlot={selectedTimeSlot}
                onChange={setSelectedTimeSlot}
                blockedSlots={disabledSlots}
                selectedDate={selectedDate}
              />

              {/* People Counter */}
              <PeopleCounter count={peopleCount} onChange={setPeopleCount} />

              {/* Availability Box */}
              <AnimatePresence mode="wait">
                {availability !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-lg flex items-center space-x-3 ${
                      availability ? "bg-green-500" : "bg-red-500"
                    } bg-opacity-90`}
                  >
                    {availability ? (
                      <>
                        <CheckCircle className="h-6 w-6 text-white" />
                        <span className="text-white font-semibold">
                          Great news! Tables are available.
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-6 w-6 text-white" />
                        <span className="text-white font-semibold">
                          No tables available for this time.
                        </span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckAvailability}
                  disabled={!isFormValid || isChecking}
                  className={`flex-1 py-4 rounded-lg font-semibold text-white ${
                    !isFormValid || isChecking
                      ? "bg-gray-400"
                      : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
                  }`}
                >
                  {isChecking ? "Checking..." : "Check Availability"}
                </motion.button>

                <motion.button
                  whileHover={{ scale: availability ? 1.02 : 1 }}
                  whileTap={{ scale: availability ? 0.98 : 1 }}
                  onClick={handleBookNow}
                  disabled={!availability}
                  className={`flex-1 py-4 rounded-lg font-semibold text-white ${
                    availability
                      ? "bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
                      : "bg-gray-400"
                  }`}
                >
                  Book Now
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-6 text-center text-amber-100 text-sm"
          >
            <p>Need help? Contact us at +1 234 567 8900</p>
          </motion.div>
        </motion.div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        bookingDetails={{
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          people: peopleCount,
        }}
      />
    </div>
  );
}

export default BookingPage;