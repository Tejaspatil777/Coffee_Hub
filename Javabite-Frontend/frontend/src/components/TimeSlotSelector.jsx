import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

function TimeSlotSelector({ selectedSlot, onChange, blockedSlots = [], selectedDate }) {

  const timeSlots = [
    { id: "morning", label: "Morning", start: 8 },
    { id: "afternoon", label: "Afternoon", start: 12 },
    { id: "evening", label: "Evening", start: 16 },
  ];

  const parseDate = (d) => {
    // If date already in YYYY-MM-DD skip conversion
    if (d.includes("-") && d.split("-")[0].length === 4) {
      return new Date(d);
    }

    // Convert DD-MM-YYYY → YYYY-MM-DD
    const [day, month, year] = d.split("-");
    return new Date(`${year}-${month}-${day}`);
  };

  const isToday = () => {
    if (!selectedDate) return false;

    const today = new Date();
    const dateObj = parseDate(selectedDate);

    return (
      today.getDate() === dateObj.getDate() &&
      today.getMonth() === dateObj.getMonth() &&
      today.getFullYear() === dateObj.getFullYear()
    );
  };

 const isPastTimeSlot = (slot) => {
  if (!isToday()) return false;

  const nowHour = new Date().getHours();

  // A slot lasts 4 hours → disable AFTER it ends
  return nowHour >= slot.start + 4;
};


  const isBackendBlocked = (slotId) => blockedSlots.includes(slotId);

  return (
    <div className="space-y-3">
      <label className="flex items-center space-x-2 text-white font-medium">
        <Clock className="h-5 w-5" />
        <span>Select Time Slot</span>
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {timeSlots.map((slot) => {
          const disabled =
            isBackendBlocked(slot.id) || isPastTimeSlot(slot);

          return (
            <button
              key={slot.id}
              disabled={disabled}
              onClick={() => !disabled && onChange(slot.id)}
              className={`p-4 rounded-lg ${
                disabled
                  ? "bg-gray-400 cursor-not-allowed opacity-50"
                  : selectedSlot === slot.id
                    ? "bg-amber-600 text-white shadow-lg"
                    : "bg-white text-gray-800"
              }`}
            >
              <div className="font-bold text-lg">{slot.label}</div>
              <div className="text-sm text-gray-600">
                {slot.label === "Morning"
                  ? "8:00 AM - 12:00 PM"
                  : slot.label === "Afternoon"
                  ? "12:00 PM - 04:00 PM"
                  : "04:00 PM - 09:00 PM"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TimeSlotSelector;
