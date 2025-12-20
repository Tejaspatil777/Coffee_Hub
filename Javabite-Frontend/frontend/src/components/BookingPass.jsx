import { motion } from "framer-motion";

function BookingPass({ booking, onDownload }) {
  if (!booking) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-amber-800 mb-4">
        Booking Confirmation
      </h2>

      <div className="space-y-2 text-gray-700">
        <p><strong>Date:</strong> {booking.date}</p>
        <p><strong>Time Slot:</strong> {booking.timeSlot}</p>
        <p><strong>No. of People:</strong> {booking.people}</p>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDownload}
        className="mt-6 w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg"
      >
        Download PDF
      </motion.button>
    </div>
  );
}

export default BookingPass;
