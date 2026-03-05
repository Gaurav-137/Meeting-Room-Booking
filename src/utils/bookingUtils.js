import { getRoomById } from "../data/rooms";

export const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

export const minutesToDisplay = (minutes) => {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
};

/**
 * OVERLAP DETECTION ALGORITHM
 * Two intervals [A.start, A.end) and [B.start, B.end) overlap when:
 *   A.start < B.end  AND  A.end > B.start
 * This covers: full containment, partial-left, partial-right, and exact match.
 */
export const detectOverlap = (newBooking, existingBookings, excludeId = null) => {
  const newStart = timeToMinutes(newBooking.startTime);
  const newEnd = timeToMinutes(newBooking.endTime);

  for (const booking of existingBookings) {
    if (booking.id === excludeId) continue; // skip self when editing
    if (booking.roomId !== newBooking.roomId) continue; // different room → no conflict
    if (booking.date !== newBooking.date) continue; // different day  → no conflict

    const existStart = timeToMinutes(booking.startTime);
    const existEnd = timeToMinutes(booking.endTime);

    if (newStart < existEnd && newEnd > existStart) {
      return { hasConflict: true, conflictingBooking: booking };
    }
  }
  return { hasConflict: false, conflictingBooking: null };
};

export const validateBooking = (form, existingBookings, excludeId = null) => {
  const errors = {};

  if (!form.title.trim()) errors.title = "Meeting title is required.";
  else if (form.title.trim().length < 3) errors.title = "Title must be at least 3 characters.";

  if (!form.organizer.trim()) errors.organizer = "Organizer name is required.";

  if (!form.date) {
    errors.date = "Please select a date.";
  } else {
    const sel = new Date(form.date);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (sel < today) errors.date = "Cannot book a date in the past.";
  }

  if (!form.startTime) errors.startTime = "Start time is required.";
  if (!form.endTime) errors.endTime = "End time is required.";

  if (form.startTime && form.endTime) {
    const s = timeToMinutes(form.startTime);
    const e = timeToMinutes(form.endTime);
    if (e <= s) errors.endTime = "End time must be later than start time.";
    else if (e - s < 15) errors.endTime = "Booking must be at least 15 minutes long.";
  }

  // Attendees vs room capacity
  const room = getRoomById(form.roomId);
  if (room && form.attendees > room.capacity) {
    errors.attendees = `Exceeds room capacity of ${room.capacity}.`;
  }

  if (!errors.date && !errors.startTime && !errors.endTime) {
    const { hasConflict, conflictingBooking } = detectOverlap(form, existingBookings, excludeId);
    if (hasConflict) {
      errors.overlap = `Room already booked by "${conflictingBooking.organizer}" for "${conflictingBooking.title}" — ${minutesToDisplay(timeToMinutes(conflictingBooking.startTime))} to ${minutesToDisplay(timeToMinutes(conflictingBooking.endTime))}.`;
    }
  }

  return errors;
};

export const getDuration = (startTime, endTime) => {
  const mins = timeToMinutes(endTime) - timeToMinutes(startTime);
  const h = Math.floor(mins / 60), m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export const groupBookingsByDate = (bookings) => {
  const grouped = {};
  [...bookings]
    .sort((a, b) => a.date !== b.date
      ? a.date.localeCompare(b.date)
      : timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
    .forEach((b) => { if (!grouped[b.date]) grouped[b.date] = []; grouped[b.date].push(b); });
  return grouped;
};

export const formatDateLabel = (dateStr) => {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tmr = new Date(today); tmr.setDate(today.getDate() + 1);
  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === tmr.getTime()) return "Tomorrow";
  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
};

export const generateId = () =>
  `bk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
