import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ROOMS, TIME_SLOTS } from "../data/rooms";
import { minutesToDisplay, timeToMinutes } from "../utils/bookingUtils";

/* ── Inline TimePicker sub-component ── */
const TimePicker = ({ id, value, onChange, options, error = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const sel = listRef.current.querySelector(".tp-option.selected");
      if (sel) sel.scrollIntoView({ block: "center", behavior: "instant" });
    }
  }, [isOpen]);

  const display = value ? minutesToDisplay(timeToMinutes(value)) : "Select time";

  return (
    <div className="tp-container" ref={containerRef}>
      <input type="text" id={id} name={id} value={value || ""} readOnly tabIndex={-1}
        style={{ position: 'absolute', opacity: 0, height: 0, width: 0, overflow: 'hidden', pointerEvents: 'none' }} />
      <button type="button" className={`tp-trigger ${error ? "tp-error" : ""} ${isOpen ? "tp-open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}>
        <span className="tp-value">{display}</span>
        <span className={`tp-chevron ${isOpen ? "tp-chevron-up" : ""}`}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 5.646a.5.5 0 0 1 .708 0L8 8.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="tp-dropdown" ref={listRef}>
          {options.map(t => {
            const hour = parseInt(t.split(":")[0]);
            const period = hour < 6 ? "early" : hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
            return (
              <button key={t} type="button"
                className={`tp-option ${t === value ? "selected" : ""} tp-${period}`}
                onClick={() => { onChange(t); setIsOpen(false); }}>
                <span className="tp-option-time">{minutesToDisplay(timeToMinutes(t))}</span>
                {t === value && <span className="tp-check">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ── Inline DatePicker sub-component ── */
const DatePicker = ({ id, value, onChange, minDate, error = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const min = minDate ? new Date(minDate + "T00:00:00") : today;

  const selected = value ? new Date(value + "T00:00:00") : null;
  const [viewYear, setViewYear] = useState(selected?.getFullYear() || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());

  useEffect(() => {
    const h = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (selected) { setViewYear(selected.getFullYear()); setViewMonth(selected.getMonth()); }
  }, [value]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthName = new Date(viewYear, viewMonth).toLocaleString("en-US", { month: "long" });

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const selectDate = (day) => {
    const m = (viewMonth + 1).toString().padStart(2, "0");
    const d = day.toString().padStart(2, "0");
    onChange(`${viewYear}-${m}-${d}`);
    setIsOpen(false);
  };

  const formatDisplay = (val) => {
    if (!val) return "Select date";
    const d = new Date(val + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="tp-container" ref={containerRef}>
      <input type="text" id={id} name={id} value={value || ""} readOnly tabIndex={-1}
        style={{ position: 'absolute', opacity: 0, height: 0, width: 0, overflow: 'hidden', pointerEvents: 'none' }} />
      <button type="button" className={`tp-trigger ${error ? "tp-error" : ""} ${isOpen ? "tp-open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}>
        <span className="tp-value">📅 {formatDisplay(value)}</span>
        <span className={`tp-chevron ${isOpen ? "tp-chevron-up" : ""}`}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 5.646a.5.5 0 0 1 .708 0L8 8.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="dp-dropdown">
          <div className="dp-header">
            <button type="button" className="dp-nav" onClick={prevMonth}>‹</button>
            <span className="dp-month-year">{monthName} {viewYear}</span>
            <button type="button" className="dp-nav" onClick={nextMonth}>›</button>
          </div>
          <div className="dp-weekdays">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <span key={d} className="dp-weekday">{d}</span>)}
          </div>
          <div className="dp-days">
            {days.map((day, i) => {
              if (!day) return <span key={`e${i}`} className="dp-empty" />;
              const date = new Date(viewYear, viewMonth, day); date.setHours(0, 0, 0, 0);
              const isPast = date < min;
              const isToday = date.getTime() === today.getTime();
              const isSel = selected && date.getTime() === selected.getTime();
              return (
                <button key={day} type="button" disabled={isPast}
                  className={`dp-day ${isSel ? "dp-selected" : ""} ${isToday ? "dp-today" : ""} ${isPast ? "dp-disabled" : ""}`}
                  onClick={() => selectDate(day)}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Main BookingForm component ── */
const EMPTY = { title: "", organizer: "", roomId: "alpha", date: "", startTime: "09:00", endTime: "10:00", attendees: 1, notes: "" };

const BookingForm = ({ onSubmit, onCancel, editingBooking, errors, successMessage, onClearMessages }) => {
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (editingBooking) { setForm({ ...editingBooking }); setTouched({}); }
    else { setForm({ ...EMPTY, date: new Date().toISOString().split("T")[0] }); setTouched({}); }
  }, [editingBooking]);

  const change = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    setTouched(p => ({ ...p, [field]: true }));
    onClearMessages?.();
  };

  const handleSubmit = () => {
    setTouched({ title: true, organizer: true, date: true, startTime: true, endTime: true });
    onSubmit(form, editingBooking?.id);
  };

  const selectedRoom = ROOMS.find(r => r.id === form.roomId);
  const endTimeOptions = TIME_SLOTS.filter(t => !form.startTime || timeToMinutes(t) > timeToMinutes(form.startTime));

  const field = (key, label, required, children) => (
    <div className="form-group" key={key}>
      <label className="form-label-custom" htmlFor={`form-${key}`}>{label} {required && <span className="required">*</span>}</label>
      {children}
      {touched[key] && errors[key] && <div className="invalid-feedback-custom">{errors[key]}</div>}
    </div>
  );

  return (
    <div className="booking-form-card">
      <div className="form-header" style={{ borderBottom: `3px solid ${selectedRoom?.color}` }}>
        <h4 className="form-title">{editingBooking ? "✏️ Edit Booking" : "➕ New Booking"}</h4>
        <p className="form-subtitle">{editingBooking ? "Modify the details below" : "Fill in the details to reserve a room"}</p>
      </div>
      <div className="form-body">
        {successMessage && <div className="alert-success-custom">{successMessage}</div>}
        {errors.overlap && createPortal(
          <div className="conflict-popup-overlay" onClick={() => onClearMessages?.()}>
            <div className="conflict-popup" onClick={e => e.stopPropagation()}>
              <div className="conflict-popup-icon">⚠️</div>
              <h3 className="conflict-popup-title">Time Conflict Detected</h3>
              <p className="conflict-popup-msg">{errors.overlap}</p>
              <button className="conflict-popup-btn" onClick={() => onClearMessages?.()}>Got it</button>
            </div>
          </div>,
          document.body
        )}

        {field("title", "Meeting Title", true,
          <input type="text" id="form-title" name="title"
            className={`form-control form-control-custom ${touched.title && errors.title ? "is-invalid" : ""}`}
            placeholder="e.g. Sprint Planning, Design Review..."
            value={form.title} onChange={e => change("title", e.target.value)} />
        )}

        {field("organizer", "Organizer", true,
          <input type="text" id="form-organizer" name="organizer"
            className={`form-control form-control-custom ${touched.organizer && errors.organizer ? "is-invalid" : ""}`}
            placeholder="Your name" value={form.organizer} onChange={e => change("organizer", e.target.value)} />
        )}

        <div className="form-group">
          <label className="form-label-custom">Select Room</label>
          <div className="room-selector">
            {ROOMS.map(room => (
              <button key={room.id} type="button"
                className={`room-option ${form.roomId === room.id ? "selected" : ""}`}
                style={form.roomId === room.id ? { borderColor: room.color, background: room.bgColor } : {}}
                onClick={() => change("roomId", room.id)}>
                <span className="room-option-icon">{room.icon}</span>
                <span className="room-option-name">{room.name}</span>
                <span className="room-option-capacity">Up to {room.capacity}</span>
                <div className="room-option-amenities">{room.amenities.slice(0, 2).join(" · ")}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="row g-2">
          <div className="col-8">
            {field("date", "Date", true,
              <DatePicker id="form-date" value={form.date}
                onChange={v => change("date", v)}
                minDate={new Date().toISOString().split("T")[0]}
                error={touched.date && errors.date} />
            )}
          </div>
          <div className="col-4">
            <div className="form-group">
              <label className="form-label-custom" htmlFor="form-attendees">👥 Attendees</label>
              <input type="number" id="form-attendees" name="attendees"
                className={`form-control form-control-custom ${(touched.attendees && errors.attendees) || form.attendees > (selectedRoom?.capacity || 999) ? "is-invalid" : ""}`}
                min={1} max={selectedRoom?.capacity || 20} value={form.attendees}
                onChange={e => change("attendees", parseInt(e.target.value) || 1)} />
              {form.attendees > (selectedRoom?.capacity || 999) && (
                <div className="invalid-feedback-custom">Exceeds room capacity of {selectedRoom?.capacity}.</div>
              )}
              {touched.attendees && errors.attendees && form.attendees <= (selectedRoom?.capacity || 999) && (
                <div className="invalid-feedback-custom">{errors.attendees}</div>
              )}
            </div>
          </div>
        </div>

        <div className="row g-2">
          <div className="col-6">
            {field("startTime", "Start Time", true,
              <TimePicker id="form-startTime" value={form.startTime} onChange={v => change("startTime", v)}
                options={TIME_SLOTS} error={touched.startTime && errors.startTime} />
            )}
          </div>
          <div className="col-6">
            {field("endTime", "End Time", true,
              <TimePicker id="form-endTime" value={form.endTime} onChange={v => change("endTime", v)}
                options={endTimeOptions} error={touched.endTime && errors.endTime} />
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label-custom" htmlFor="form-notes">Notes (optional)</label>
          <textarea id="form-notes" name="notes" className="form-control form-control-custom" rows={2}
            placeholder="Add any notes or agenda..."
            value={form.notes} onChange={e => change("notes", e.target.value)} />
        </div>

        <div className="form-actions">
          <button className="btn-submit" style={{ background: selectedRoom?.color }} onClick={handleSubmit}>
            {editingBooking ? "💾 Update Booking" : "📌 Book Room"}
          </button>
          {editingBooking && <button className="btn-cancel" onClick={onCancel}>Cancel</button>}
        </div>
      </div>
    </div>
  );
};
export default BookingForm;
