import React, { useState, useMemo } from "react";
import { ROOMS } from "./data/rooms";
import { useBookings } from "./hooks/useBookings";
import BookingForm from "./components/BookingForm";
import BookingCard from "./components/BookingCard";
import BookingDetailModal from "./components/BookingDetailModal";
import StatsPanel from "./components/StatsPanel";
import FilterBar from "./components/FilterBar";
import RoomCalendar from "./components/RoomCalendar";
import { formatDateLabel, timeToMinutes } from "./utils/bookingUtils";
import "./App.css";

const App = () => {
  const {
    bookings, errors, successMessage, editingId, stats,
    addBooking, updateBooking, deleteBooking, startEdit, cancelEdit, clearMessages
  } = useBookings();

  const [filters, setFilters] = useState({ search: "", rooms: ROOMS.map(r => r.id), date: "" });
  const [activeTab, setActiveTab] = useState("list");
  const [calendarDate, setCalendarDate] = useState(new Date().toISOString().split("T")[0]);
  const [viewingBooking, setViewingBooking] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  const editingBooking = editingId ? bookings.find(b => b.id === editingId) : null;

  const handleSubmit = (formData, id) => {
    if (id) updateBooking(id, formData);
    else { if (addBooking(formData)) setResetKey(k => k + 1); }
  };

  const filtered = useMemo(() => bookings.filter(b => {
    const sl = filters.search.toLowerCase();
    return filters.rooms.includes(b.roomId)
      && (!filters.date || b.date === filters.date)
      && (!filters.search || b.title.toLowerCase().includes(sl)
        || b.organizer.toLowerCase().includes(sl)
        || b.notes?.toLowerCase().includes(sl));
  }), [bookings, filters]);

  const filteredGrouped = useMemo(() => {
    const g = {};
    [...filtered]
      .sort((a, b) => a.date !== b.date ? a.date.localeCompare(b.date) : timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
      .forEach(b => { if (!g[b.date]) g[b.date] = []; g[b.date].push(b); });
    return g;
  }, [filtered]);

  return (
    <div className="app-root">
      <nav className="app-navbar">
        <div className="navbar-brand">
          <span className="brand-icon">🏢</span>
          <span className="brand-text">RoomSync</span>
          <span className="brand-tagline">Meeting Room Booking</span>
        </div>
        <span className="navbar-time">
          {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </span>
      </nav>
      <div className="app-container">
        <aside className="form-panel">
          <BookingForm key={resetKey}
            onSubmit={handleSubmit} onCancel={cancelEdit}
            editingBooking={editingBooking} errors={errors}
            successMessage={successMessage} onClearMessages={clearMessages} />
        </aside>
        <main className="bookings-panel">
          <StatsPanel stats={stats} bookings={bookings} />
          <div className="view-tabs mb-3">
            <button className={`tab-btn ${activeTab === "list" ? "active" : ""}`} onClick={() => setActiveTab("list")}>📋 List View</button>
            <button className={`tab-btn ${activeTab === "calendar" ? "active" : ""}`} onClick={() => setActiveTab("calendar")}>🗓️ Timeline</button>
            {activeTab === "calendar" && (
              <input type="date" className="form-control calendar-date-input"
                value={calendarDate} onChange={e => setCalendarDate(e.target.value)} />
            )}
          </div>
          {activeTab === "calendar" ? (
            <RoomCalendar bookings={bookings} onView={setViewingBooking} selectedDate={calendarDate} />
          ) : (
            <>
              <FilterBar filters={filters} onChange={setFilters}
                totalVisible={filtered.length} totalAll={bookings.length} />
              {Object.keys(filteredGrouped).length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h5>No bookings found</h5>
                  <p>{filters.search || filters.date || filters.rooms.length < ROOMS.length
                    ? "Try adjusting your filters."
                    : "Create your first booking using the form on the left."}</p>
                </div>
              ) : (
                Object.entries(filteredGrouped).map(([date, dbs]) => (
                  <div key={date} className="date-group">
                    <div className="date-group-header">
                      <span className="date-group-label">{formatDateLabel(date)}</span>
                      <span className="date-group-count">{dbs.length} booking{dbs.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="bookings-grid">
                      {dbs.map(b => (
                        <BookingCard key={b.id} booking={b}
                          onDelete={deleteBooking} onEdit={startEdit}
                          onView={setViewingBooking} searchTerm={filters.search} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </main>
      </div>
      {viewingBooking && (
        <BookingDetailModal
          booking={viewingBooking}
          onClose={() => setViewingBooking(null)}
          onUpdate={(id, data) => {
            updateBooking(id, data);
            setViewingBooking({ ...data, id });
          }}
        />
      )}
    </div>
  );
};
export default App;
