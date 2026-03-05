import React, { useState, useEffect, useRef } from "react";
import { getRoomById, ROOMS } from "../data/rooms";
import { minutesToDisplay, timeToMinutes, getDuration } from "../utils/bookingUtils";

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

/* ── Inline RoomPicker sub-component ── */
const RoomPicker = ({ id, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const selectedRoom = ROOMS.find(r => r.id === value);

    useEffect(() => {
        const h = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    return (
        <div className="tp-container" ref={containerRef}>
            <input type="text" id={id} name={id} value={value || ""} readOnly tabIndex={-1}
                style={{ position: 'absolute', opacity: 0, height: 0, width: 0, overflow: 'hidden', pointerEvents: 'none' }} />
            <button type="button" className={`tp-trigger ${isOpen ? "tp-open" : ""}`}
                onClick={() => setIsOpen(!isOpen)}>
                <span className="tp-value">
                    {selectedRoom ? (
                        <span className="rp-selected">
                            <span className="rp-icon">{selectedRoom.icon}</span>
                            <span>{selectedRoom.name}</span>
                            <span className="rp-capacity">Up to {selectedRoom.capacity}</span>
                        </span>
                    ) : "Select room"}
                </span>
                <span className={`tp-chevron ${isOpen ? "tp-chevron-up" : ""}`}>
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M4.646 5.646a.5.5 0 0 1 .708 0L8 8.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z" />
                    </svg>
                </span>
            </button>
            {isOpen && (
                <div className="tp-dropdown rp-dropdown">
                    {ROOMS.map(room => {
                        const isSelected = room.id === value;
                        return (
                            <button key={room.id} type="button"
                                className={`tp-option rp-option ${isSelected ? "selected" : ""}`}
                                onClick={() => { onChange(room.id); setIsOpen(false); }}>
                                <span className="rp-option-left">
                                    <span className="rp-option-icon" style={{ background: room.bgColor, color: room.color }}>{room.icon}</span>
                                    <span className="rp-option-info">
                                        <span className="rp-option-name">{room.name}</span>
                                        <span className="rp-option-meta">Up to {room.capacity} · {room.amenities.slice(0, 2).join(", ")}</span>
                                    </span>
                                </span>
                                {isSelected && <span className="tp-check">✓</span>}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/* ── Inline DatePicker sub-component ── */
const DatePicker = ({ id, value, onChange, error = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const today = new Date(); today.setHours(0, 0, 0, 0);
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
                            const isPast = date < today;
                            const isTd = date.getTime() === today.getTime();
                            const isSel = selected && date.getTime() === selected.getTime();
                            return (
                                <button key={day} type="button" disabled={isPast}
                                    className={`dp-day ${isSel ? "dp-selected" : ""} ${isTd ? "dp-today" : ""} ${isPast ? "dp-disabled" : ""}`}
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

/* ── Date formatter for view mode ── */
const formatFullDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
};

/* ── Main BookingDetailModal component ── */
const BookingDetailModal = ({ booking, onClose, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...booking });
    const [errors, setErrors] = useState({});
    const room = getRoomById(booking.roomId);

    useEffect(() => {
        setFormData({ ...booking });
        setIsEditing(false);
        setErrors({});
    }, [booking]);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    const editRoom = getRoomById(formData.roomId);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
    };

    const handleSave = () => {
        const errs = {};
        if (!formData.title?.trim()) errs.title = "Title is required.";
        else if (formData.title.trim().length < 3) errs.title = "Title must be at least 3 characters.";
        if (!formData.organizer?.trim()) errs.organizer = "Organizer is required.";
        if (!formData.date) errs.date = "Date is required.";
        if (!formData.startTime) errs.startTime = "Start time is required.";
        if (!formData.endTime) errs.endTime = "End time is required.";
        if (formData.startTime && formData.endTime) {
            const s = timeToMinutes(formData.startTime);
            const e = timeToMinutes(formData.endTime);
            if (e <= s) errs.endTime = "End time must be after start time.";
        }
        const selectedRoom = getRoomById(formData.roomId);
        if (selectedRoom && formData.attendees > selectedRoom.capacity) {
            errs.attendees = `Exceeds room capacity of ${selectedRoom.capacity}`;
        }
        if (Object.keys(errs).length) { setErrors(errs); return; }
        onUpdate(booking.id, formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({ ...booking });
        setErrors({});
        setIsEditing(false);
    };

    const isPast = new Date(booking.date + "T" + booking.startTime) < new Date();
    const isToday = booking.date === new Date().toISOString().split("T")[0];

    const timeOptions = [];
    for (let h = 0; h < 24; h++) {
        for (const m of ["00", "30"]) {
            timeOptions.push(`${h.toString().padStart(2, "0")}:${m}`);
        }
    }

    const endTimeOptions = timeOptions.filter(t => !formData.startTime || timeToMinutes(t) > timeToMinutes(formData.startTime));
    const attendeesOverCapacity = editRoom && formData.attendees > editRoom.capacity;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>

                {/* ── Header ── */}
                <div className="modal-header">
                    <div className="modal-header-left">
                        <div className="modal-room-badge" style={{ background: room?.bgColor, color: room?.color }}>
                            <span>{room?.icon}</span>
                            <span>{room?.name}</span>
                        </div>
                        <div className="modal-status-badges">
                            {isPast && <span className="modal-badge-status modal-badge-past">Completed</span>}
                            {!isPast && isToday && <span className="modal-badge-status modal-badge-today">● Today</span>}
                            {!isPast && !isToday && booking.date > new Date().toISOString().split("T")[0] &&
                                <span className="modal-badge-status modal-badge-upcoming">Upcoming</span>}
                        </div>
                    </div>
                    <div className="modal-header-actions">
                        {isEditing
                            ? <span className="modal-mode-label">Editing</span>
                            : <button className="modal-btn-edit" onClick={() => setIsEditing(true)}>✏️ Edit</button>
                        }
                        <button className="modal-btn-close" onClick={onClose}>✕</button>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="modal-body">
                    {isEditing ? (
                        <div className="modal-edit-form">
                            <div className="modal-form-group">
                                <label className="modal-form-label" htmlFor="edit-title">Meeting Title</label>
                                <input id="edit-title" name="title"
                                    className={`modal-form-input ${errors.title ? "modal-input-error" : ""}`}
                                    value={formData.title} onChange={e => handleChange("title", e.target.value)} />
                                {errors.title && <span className="modal-field-error">{errors.title}</span>}
                            </div>

                            <div className="modal-form-group">
                                <label className="modal-form-label" htmlFor="edit-organizer">Organizer</label>
                                <input id="edit-organizer" name="organizer"
                                    className={`modal-form-input ${errors.organizer ? "modal-input-error" : ""}`}
                                    value={formData.organizer} onChange={e => handleChange("organizer", e.target.value)} />
                                {errors.organizer && <span className="modal-field-error">{errors.organizer}</span>}
                            </div>

                            <div className="modal-form-group">
                                <label className="modal-form-label" htmlFor="edit-roomId">Room</label>
                                <RoomPicker id="edit-roomId" value={formData.roomId} onChange={v => handleChange("roomId", v)} />
                            </div>

                            <div className="modal-form-row">
                                <div className="modal-form-group">
                                    <label className="modal-form-label" htmlFor="edit-date">Date</label>
                                    <DatePicker id="edit-date" value={formData.date}
                                        onChange={v => handleChange("date", v)} error={errors.date} />
                                    {errors.date && <span className="modal-field-error">{errors.date}</span>}
                                </div>
                                <div className="modal-form-group">
                                    <label className="modal-form-label" htmlFor="edit-attendees">Attendees</label>
                                    <input type="number" id="edit-attendees" name="attendees" min="1"
                                        className={`modal-form-input ${errors.attendees || attendeesOverCapacity ? "modal-input-error" : ""}`}
                                        value={formData.attendees}
                                        onChange={e => handleChange("attendees", parseInt(e.target.value) || 1)} />
                                    {(errors.attendees || attendeesOverCapacity) && (
                                        <span className="modal-field-error">
                                            {errors.attendees || `Exceeds room capacity of ${editRoom.capacity}`}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="modal-form-row">
                                <div className="modal-form-group">
                                    <label className="modal-form-label" htmlFor="edit-startTime">Start Time</label>
                                    <TimePicker id="edit-startTime" value={formData.startTime} onChange={v => handleChange("startTime", v)}
                                        options={timeOptions} error={errors.startTime} />
                                    {errors.startTime && <span className="modal-field-error">{errors.startTime}</span>}
                                </div>
                                <div className="modal-form-group">
                                    <label className="modal-form-label" htmlFor="edit-endTime">End Time</label>
                                    <TimePicker id="edit-endTime" value={formData.endTime} onChange={v => handleChange("endTime", v)}
                                        options={endTimeOptions} error={errors.endTime} />
                                    {errors.endTime && <span className="modal-field-error">{errors.endTime}</span>}
                                </div>
                            </div>

                            <div className="modal-form-group">
                                <label className="modal-form-label" htmlFor="edit-notes">Notes</label>
                                <textarea id="edit-notes" name="notes" className="modal-form-input modal-textarea" rows="3"
                                    value={formData.notes || ""} onChange={e => handleChange("notes", e.target.value)}
                                    placeholder="Add meeting notes..." />
                            </div>

                            <div className="modal-edit-actions">
                                <button className="modal-btn-save" onClick={handleSave}>💾 Save Changes</button>
                                <button className="modal-btn-cancel" onClick={handleCancel}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="modal-detail-view">
                            <h2 className="modal-booking-title">{booking.title}</h2>

                            <div className="modal-detail-grid">
                                <div className="modal-detail-item">
                                    <span className="modal-detail-icon">📅</span>
                                    <div>
                                        <span className="modal-detail-label">Date</span>
                                        <span className="modal-detail-value">{formatFullDate(booking.date)}</span>
                                    </div>
                                </div>
                                <div className="modal-detail-item">
                                    <span className="modal-detail-icon">🕐</span>
                                    <div>
                                        <span className="modal-detail-label">Time</span>
                                        <span className="modal-detail-value">
                                            {minutesToDisplay(timeToMinutes(booking.startTime))} — {minutesToDisplay(timeToMinutes(booking.endTime))}
                                        </span>
                                        <span className="modal-detail-sub">Duration: {getDuration(booking.startTime, booking.endTime)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-detail-grid" style={{ marginTop: 12 }}>
                                <div className="modal-detail-item">
                                    <span className="modal-detail-icon">👤</span>
                                    <div>
                                        <span className="modal-detail-label">Organizer</span>
                                        <span className="modal-detail-value">{booking.organizer}</span>
                                    </div>
                                </div>
                                <div className="modal-detail-item">
                                    <span className="modal-detail-icon">👥</span>
                                    <div>
                                        <span className="modal-detail-label">Attendees</span>
                                        <span className="modal-detail-value">{booking.attendees} {booking.attendees === 1 ? "person" : "people"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-section-divider"></div>

                            <div className="modal-detail-item modal-detail-fullwidth">
                                <span className="modal-detail-icon">{room?.icon}</span>
                                <div>
                                    <span className="modal-detail-label">Room</span>
                                    <span className="modal-detail-value">{room?.name}</span>
                                    <span className="modal-detail-sub">Capacity: {room?.capacity} · {room?.amenities?.join(", ")}</span>
                                </div>
                            </div>

                            {booking.notes && (
                                <div className="modal-detail-item modal-detail-fullwidth" style={{ marginTop: 12 }}>
                                    <span className="modal-detail-icon">📝</span>
                                    <div>
                                        <span className="modal-detail-label">Notes</span>
                                        <span className="modal-detail-value modal-notes-text">{booking.notes}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingDetailModal;
