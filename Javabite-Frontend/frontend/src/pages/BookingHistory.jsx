import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from "axios";

// Helper: Convert DD-MM-YYYY → YYYY-MM-DD
const normalizeDate = (d) => {
  if (!d) return null;

  // Already in YYYY-MM-DD format
  if (d.includes("-") && d.split("-")[0].length === 4) return d;

  // Convert DD-MM-YYYY → YYYY-MM-DD
  const parts = d.split("-");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }

  return null;
};

function BookingHistory() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:8080/booking/user", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const formatted = res.data.map(b => ({
        ...b,
        status: b.status.charAt(0) + b.status.slice(1).toLowerCase()
      }));

      setBookings(formatted);

    } catch (err) {
      console.error("Failed to load bookings", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'Completed': return <CheckCircle className="h-4 w-4" />;
      case 'Cancelled': return <XCircle className="h-4 w-4" />;
      case 'Pending': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // FIXED DATE HANDLER
  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";

    let safe = normalizeDate(dateString);
    if (!safe) return "Invalid Date";

    const date = new Date(safe);
    if (isNaN(date)) return "Invalid Date";

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // ⭐ NEW: Convert morning/afternoon/evening → actual timing
  const getTimeRange = (slot) => {
    switch (slot?.toLowerCase()) {
      case "morning":
        return "08:00 AM - 12:00 PM";
      case "afternoon":
        return "12:00 PM - 04:00 PM";
      case "evening":
        return "04:00 PM - 09:00 PM";
      default:
        return slot;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >

        <div className="flex items-center gap-3 mb-8">
          <Calendar className="h-10 w-10 text-amber-700" />
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Booking History</h1>
            <p className="text-gray-600">{bookings.length} total bookings</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-12 text-center shadow-lg"
          >
            <Calendar className="h-20 w-20 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No bookings yet</h2>
            <p className="text-gray-600">Start booking tables to see your history here</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-amber-600 to-amber-700 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Booking ID</th>
                    <th className="px-6 py-4 text-left font-semibold">Date</th>
                    <th className="px-6 py-4 text-left font-semibold">Time Slot</th>
                    <th className="px-6 py-4 text-left font-semibold">People</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Booked On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking, index) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-amber-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-amber-700">{booking.id}</span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold text-gray-800">
                            {formatDate(booking.date)}
                          </span>
                        </div>
                      </td>

                      {/* ⭐ UPDATED TIME SLOT HERE */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">{getTimeRange(booking.timeSlot)}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold text-gray-800">
                            {booking.numberOfPeople}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(booking.createdAt)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ⭐ MOBILE CARD UPDATED */}
            <div className="md:hidden p-4 space-y-4">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 shadow-md"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-mono font-bold text-amber-700">{booking.id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-gray-800">
                        {formatDate(booking.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{getTimeRange(booking.timeSlot)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{booking.numberOfPeople} people</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}

export default BookingHistory;
