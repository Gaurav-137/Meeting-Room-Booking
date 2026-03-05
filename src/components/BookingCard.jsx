import React, { useState } from "react";
import { getRoomById } from "../data/rooms";
import { minutesToDisplay, timeToMinutes, getDuration } from "../utils/bookingUtils";

const BookingCard = ({ booking, onDelete, onView, searchTerm }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const room = getRoomById(booking.roomId);

  const highlight = (text) => {
    if (!searchTerm?.trim()) return text;
    const regex = new RegExp(`(${searchTerm.trim()})`, "gi");
    return String(text).split(regex).map((part, i) =>
      regex.test(part) ? <mark key={i} className="search-highlight">{part}</mark> : part
    );
  };

  const isPast = new Date(booking.date + "T" + booking.startTime) < new Date();
  const isToday = booking.date === new Date().toISOString().split("T")[0];

  return (
    <div className={`booking-card ${isPast ? "booking-past" : ""} ${isToday ? "booking-today" : ""}`}
      style={{ borderLeft: `4px solid ${room?.color}` }}>
      <div className="booking-card-header">
        <div className="booking-room-badge" style={{ background: room?.bgColor, color: room?.color }}>
          <span>{room?.icon}</span><span>{room?.name}</span>
        </div>
        <div className="booking-header-right">
          {isToday && !isPast && <span className="badge-today">● Today</span>}
          {isPast && <span className="badge-past">Completed</span>}
          <button className="btn-view" onClick={() => onView(booking)} title="View details">View</button>
        </div>
      </div>
      <h5 className="booking-title">{highlight(booking.title)}</h5>
      <div className="booking-time-row">
        <span className="booking-time-display">
          🕐 {minutesToDisplay(timeToMinutes(booking.startTime))} — {minutesToDisplay(timeToMinutes(booking.endTime))}
        </span>
        <span className="booking-duration">{getDuration(booking.startTime, booking.endTime)}</span>
      </div>
      <div className="booking-meta">
        <span className="booking-meta-item">👤 {highlight(booking.organizer)}</span>
        {booking.attendees > 0 && <span className="booking-meta-item">👥 {booking.attendees} attendees</span>}
      </div>
      {booking.notes && <p className="booking-notes">📝 {booking.notes}</p>}
      <div className="booking-actions">
        {!confirmDelete
          ? <button className="btn-delete" onClick={() => setConfirmDelete(true)}>🗑️ Delete</button>
          : <div className="confirm-delete">
            <span>Sure?</span>
            <button className="btn-confirm-yes" onClick={() => onDelete(booking.id)}>Yes</button>
            <button className="btn-confirm-no" onClick={() => setConfirmDelete(false)}>No</button>
          </div>
        }
      </div>
    </div>
  );
};
export default BookingCard;
