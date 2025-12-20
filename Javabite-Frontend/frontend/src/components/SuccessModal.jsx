import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, Coffee } from 'lucide-react';
import { jsPDF } from "jspdf";

function SuccessModal({ isOpen, onClose, bookingDetails }) {

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: "a4"
    });

    // ------- COLORS -------
    const primary = "#8B4513";   // coffee brown
    const accent = "#D2691E";    // caramel
    const light = "#F5DEB3";

    // ------- HEADER -------
    doc.setFillColor(primary);
    doc.rect(0, 0, 450, 80, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor("#FFFFFF");
    doc.text("JavaBite – Booking Pass", 30, 50);

    // ------- CARD BOX -------
    doc.setFillColor("#ffffff");
    doc.roundedRect(20, 100, 410, 500, 12, 12, "F");

    // ------- LOGO ICON -------
    doc.setFontSize(35);
    doc.setTextColor(accent);
    doc.text("☕", 210, 150, { align: "center" });

    // ------- TITLE -------
    doc.setFontSize(20);
    doc.setTextColor(primary);
    doc.text("Your Booking is Confirmed!", 210, 190, { align: "center" });

    // ------- LINE SEPARATOR -------
    doc.setDrawColor(accent);
    doc.setLineWidth(2);
    doc.line(60, 210, 390, 210);

    // ------- BOOKING DETAILS -------
    doc.setFontSize(14);
    doc.setTextColor("#333");

    const bookingId = "JB" + Math.floor(Math.random() * 90000);

    const details = [
      ["Date", bookingDetails.date],
      ["Time Slot", bookingDetails.timeSlot],
      ["Number of People", bookingDetails.people],
      ["Booking ID", bookingId]
    ];

    let y = 250;
    details.forEach(([label, value]) => {
      doc.setFont("Helvetica", "bold");
      doc.text(`${label}:`, 60, y);

      doc.setFont("Helvetica", "normal");
      doc.text(String(value), 200, y);

      y += 40;
    });

    // ------- FOOTER -------
    doc.setFontSize(12);
    doc.setTextColor("#777");
    doc.text(
      "Thank you for choosing JavaBite. Please show this pass at the counter.",
      225,
      570,
      { align: "center" }
    );

    doc.save("JavaBite-Booking-Pass.pdf");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-300"
              >
                <X className="h-5 w-5" />
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                className="flex justify-center mb-4"
              >
                <div className="bg-white rounded-full p-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
              </motion.div>

              <h2 className="text-3xl font-bold text-white text-center">Booking Confirmed!</h2>
            </div>

            <div className="p-8">
              <div className="flex items-center justify-center mb-6">
                <Coffee className="h-12 w-12 text-amber-600" />
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-600 font-medium">Date</span>
                  <span className="text-gray-900 font-bold">{bookingDetails.date}</span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-600 font-medium">Time Slot</span>
                  <span className="text-gray-900 font-bold capitalize">{bookingDetails.timeSlot}</span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-600 font-medium">People</span>
                  <span className="text-gray-900 font-bold">{bookingDetails.people}</span>
                </div>
              </div>

              {/* Download PDF Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={generatePDF}
                className="w-full mb-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Download Booking Pass (PDF)
              </motion.button>

              {/* Done Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Done
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SuccessModal;
