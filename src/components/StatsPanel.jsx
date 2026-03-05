import React from "react";
import { ROOMS } from "../data/rooms";

const StatsPanel = ({ stats, bookings }) => {
  const roomCounts = ROOMS.map(r => ({ ...r, count: bookings.filter(b => b.roomId === r.id).length }));
  return (
    <div className="stats-panel mb-4">
      <div className="row g-3">
        {[
          { icon:"📋", num: stats.total,    label:"Total Bookings", cls:"" },
          { icon:"📅", num: stats.today,    label:"Today",          cls:"today" },
          { icon:"🔮", num: stats.upcoming, label:"Upcoming",       cls:"upcoming" },
          { icon:"🏢", num: ROOMS.length,   label:"Rooms",          cls:"" },
        ].map(({ icon, num, label, cls }) => (
          <div className="col-6 col-md-3" key={label}>
            <div className={`stat-card ${cls ? "stat-"+cls : ""}`}>
              <div className="stat-icon">{icon}</div>
              <div className="stat-number">{num}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="row g-2 mt-1">
        {roomCounts.map(room => (
          <div className="col-12 col-md-4" key={room.id}>
            <div className="room-stat-bar" style={{ borderLeft:`4px solid ${room.color}` }}>
              <span className="room-stat-icon">{room.icon}</span>
              <span className="room-stat-name">{room.name}</span>
              <span className="room-stat-badge" style={{ background:room.bgColor, color:room.color }}>
                {room.count} booking{room.count !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default StatsPanel;
