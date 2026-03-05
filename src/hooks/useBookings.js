import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { validateBooking, generateId, groupBookingsByDate } from "../utils/bookingUtils";

const STORAGE_KEY = "roomsync_bookings";
const today = () => new Date().toISOString().split("T")[0];

const loadBookings = () => {
  try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : []; }
  catch { return []; }
};

export const useBookings = () => {
  const [bookings, setBookings] = useState(loadBookings);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const bookingsRef = useRef(bookings);

  useEffect(() => { bookingsRef.current = bookings; }, [bookings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings)); }, [bookings]);

  const clearMessages = useCallback(() => { setErrors({}); setSuccessMessage(""); }, []);

  const addBooking = useCallback((formData) => {
    const errs = validateBooking(formData, bookingsRef.current);
    if (Object.keys(errs).length) { setErrors(errs); setSuccessMessage(""); return false; }
    setBookings(prev => [...prev, { ...formData, id: generateId() }]);
    setErrors({});
    setSuccessMessage(`✅ "${formData.title}" booked successfully!`);
    return true;
  }, []);

  const updateBooking = useCallback((id, formData) => {
    const errs = validateBooking(formData, bookingsRef.current, id);
    if (Object.keys(errs).length) { setErrors(errs); setSuccessMessage(""); return false; }
    setBookings(prev => prev.map(b => b.id === id ? { ...formData, id } : b));
    setErrors({}); setSuccessMessage(`✅ "${formData.title}" updated!`); setEditingId(null);
    return true;
  }, []);

  const deleteBooking = useCallback((id) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    setSuccessMessage("🗑️ Booking removed."); setErrors({});
  }, []);

  const startEdit = useCallback((id) => { setEditingId(id); clearMessages(); }, [clearMessages]);
  const cancelEdit = useCallback(() => { setEditingId(null); clearMessages(); }, [clearMessages]);

  const groupedBookings = useMemo(() => groupBookingsByDate(bookings), [bookings]);

  const stats = useMemo(() => ({
    total: bookings.length,
    today: bookings.filter(b => b.date === today()).length,
    upcoming: bookings.filter(b => b.date >= today()).length,
  }), [bookings]);

  return {
    bookings, groupedBookings, errors, successMessage, editingId, stats,
    addBooking, updateBooking, deleteBooking, startEdit, cancelEdit, clearMessages
  };
};
