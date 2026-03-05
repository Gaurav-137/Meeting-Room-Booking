import React from "react";
import { ROOMS } from "../data/rooms";

const FilterBar = ({ filters, onChange, totalVisible, totalAll }) => {
  const toggleRoom = (id) => {
    const cur = filters.rooms;
    onChange({ ...filters, rooms: cur.includes(id) ? cur.filter(r=>r!==id) : [...cur, id] });
  };
  const clearAll = () => onChange({ search:"", rooms: ROOMS.map(r=>r.id), date:"" });
  const hasActive = filters.search !== "" || filters.rooms.length !== ROOMS.length || filters.date !== "";

  return (
    <div className="filter-bar mb-4">
      <div className="row g-2 align-items-end">
        <div className="col-12 col-md-4">
          <label className="filter-label">🔍 Search Bookings</label>
          <div className="search-wrapper">
            <input type="text" className="form-control filter-input"
              placeholder="Search by title, organizer..."
              value={filters.search}
              onChange={e => onChange({ ...filters, search: e.target.value })} />
            {filters.search && (
              <button className="search-clear-btn" onClick={() => onChange({ ...filters, search:"" })}>×</button>
            )}
          </div>
        </div>
        <div className="col-12 col-md-3">
          <label className="filter-label">📆 Filter by Date</label>
          <input type="date" className="form-control filter-input"
            value={filters.date} onChange={e => onChange({ ...filters, date: e.target.value })} />
        </div>
        <div className="col-12 col-md-5">
          <label className="filter-label">🏢 Rooms</label>
          <div className="room-toggle-group">
            {ROOMS.map(room => (
              <button key={room.id}
                className={`room-toggle-btn ${filters.rooms.includes(room.id) ? "active" : "inactive"}`}
                style={filters.rooms.includes(room.id)
                  ? { background:room.color, borderColor:room.color, color:"#fff" } : {}}
                onClick={() => toggleRoom(room.id)}>
                {room.icon} {room.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="filter-summary mt-2">
        <span className="results-count">Showing <strong>{totalVisible}</strong> of <strong>{totalAll}</strong> bookings</span>
        {hasActive && <button className="btn-clear-filters" onClick={clearAll}>✕ Clear All Filters</button>}
      </div>
    </div>
  );
};
export default FilterBar;
