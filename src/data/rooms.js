export const ROOMS = [
  {
    id: "alpha",
    name: "Alpha Suite",
    capacity: 12,
    color: "#FF6B35",
    bgColor: "#FFF3EE",
    borderColor: "#FFD4C2",
    icon: "🏛️",
    amenities: ["Projector", "Whiteboard", "Video Call"],
  },
  {
    id: "beta",
    name: "Beta Hub",
    capacity: 6,
    color: "#2EC4B6",
    bgColor: "#EDFAFA",
    borderColor: "#B8F0EC",
    icon: "⚡",
    amenities: ["TV Screen", "Whiteboard", "Coffee Station"],
  },
  {
    id: "gamma",
    name: "Gamma Lounge",
    capacity: 20,
    color: "#9B5DE5",
    bgColor: "#F5EEFF",
    borderColor: "#DFC9FF",
    icon: "🚀",
    amenities: ["Dual Projectors", "Stage", "Full AV System"],
  },
];

export const getRoomById = (id) => ROOMS.find((r) => r.id === id);

export const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return [`${hour}:00`, `${hour}:30`];
}).flat();
