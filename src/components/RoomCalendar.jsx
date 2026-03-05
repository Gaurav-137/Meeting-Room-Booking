import React, { useMemo } from "react";
import { ROOMS } from "../data/rooms";
import { timeToMinutes, minutesToDisplay, getDuration } from "../utils/bookingUtils";

const HOUR_START = 8, HOUR_END = 20, TOTAL_MINS = (HOUR_END - HOUR_START) * 60;

const RoomCalendar = ({ bookings, onView, selectedDate }) => {
  const dateLabel = selectedDate || new Date().toISOString().split("T")[0];
  const dayBookings = bookings.filter(b => b.date === dateLabel);
  const hours = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);

  const pct = (t) => Math.max(0, ((timeToMinutes(t) - HOUR_START * 60) / TOTAL_MINS) * 100);
  const wid = (s, e) => ((timeToMinutes(e) - timeToMinutes(s)) / TOTAL_MINS) * 100;

  return (
    <div className="calendar-view mb-4">
      <div className="calendar-header">
        <h5 className="calendar-title">🗓️ Timeline —&nbsp;
          <span>{new Date(dateLabel + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
        </h5>
        <span className="calendar-subtitle">{dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="calendar-body">
        <div className="hour-ruler">
          {hours.map(h => (
            <div key={h} className="hour-marker" style={{ left: `${((h - HOUR_START) / (HOUR_END - HOUR_START)) * 100}%` }}>
              <span className="hour-label">{minutesToDisplay(h * 60).replace(":00", "")}</span>
            </div>
          ))}
        </div>
        {ROOMS.map(room => (
          <div key={room.id} className="calendar-room-row">
            <div className="calendar-room-label">
              <span className="room-icon-sm">{room.icon}</span>
              <span className="room-name-sm">{room.name}</span>
            </div>
            <div className="calendar-timeline">
              {hours.map(h => (
                <div key={h} className="grid-line" style={{ left: `${((h - HOUR_START) / (HOUR_END - HOUR_START)) * 100}%` }} />
              ))}
              {dayBookings.filter(b => b.roomId === room.id).map(b => {
                const left = pct(b.startTime);
                const width = wid(b.startTime, b.endTime);
                if (left >= 100 || left + width <= 0) return null;
                return (
                  <div key={b.id} className="booking-block"
                    style={{ left: `${left}%`, width: `${Math.min(width, 100 - left)}%`, background: room.color }}
                    onClick={() => onView(b)}
                    title={`${b.title} (${minutesToDisplay(timeToMinutes(b.startTime))} - ${minutesToDisplay(timeToMinutes(b.endTime))})`}>
                    <span className="block-title">{b.title}</span>
                    <span className="block-duration">{getDuration(b.startTime, b.endTime)}</span>
                  </div>
                );
              })}
              {dayBookings.filter(b => b.roomId === room.id).length === 0 && (
                <div className="no-bookings-hint">No bookings — click a room block to edit</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RoomCalendar;
