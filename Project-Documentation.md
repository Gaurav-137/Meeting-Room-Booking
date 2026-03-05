# RoomSync — Project Documentation

## 1. Logic Used for Overlap Detection

The overlap detection uses a classic **interval intersection algorithm**. Every booking has a start time and end time, which are converted from "HH:MM" strings into total minutes for easy comparison. Two time intervals overlap when:

> **New booking starts before the existing one ends AND new booking ends after the existing one starts**
>
> `newStart < existEnd && newEnd > existStart`

Before checking times, the algorithm first filters — it skips bookings in **different rooms** or on **different dates** (no point comparing). When editing an existing booking, it also skips **self-comparison** using an `excludeId` parameter. If a conflict is found, the function returns the conflicting booking's details (who booked it, title, time range) so we can show a meaningful error message to the user.

---

## 2. What Parts Were AI-Generated

The initial project scaffolding was AI-generated — the base component structure (`BookingForm`, `BookingCard`, `BookingDetailModal`, `FilterBar`, `StatsPanel`, `RoomCalendar`), the CSS design system with custom properties, the utility functions in `bookingUtils.js`, the room data, and the overall layout. The custom TimePicker, RoomPicker, and DatePicker dropdown components were also AI-generated based on my requirements and feedback.

---

## 3. What I Corrected from AI Output

- **Stale closure bug**: The `addBooking` function used `useCallback` with `[bookings]` as dependency, causing newly added bookings to not appear without a page refresh. I fixed this by using `useRef` to always reference the latest bookings.

- **Form not resetting**: After a successful submission, the form retained old data. I added a `key={resetKey}` mechanism to force React to remount the form component after each booking.

- **Accessibility warnings**: The browser console showed warnings about form fields missing `id`/`name` attributes and labels not being associated. I added proper `id`, `name`, and `htmlFor` attributes to all fields and replaced `type="hidden"` inputs with visually-hidden `type="text"` inputs since hidden inputs aren't labelable elements.

- **Z-index stacking issue**: The conflict popup rendered inside a `position: sticky` panel, trapping its z-index and causing the search bar to bleed through. I fixed this using `ReactDOM.createPortal` to render the popup at the document body level.

---

## 4. What I Improved Beyond AI

- **Data persistence**: Added `localStorage` support so bookings survive page refreshes — the AI-generated version only used in-memory React state.

- **Custom DatePicker**: Replaced the browser's native `<input type="date">` with a styled mini-calendar dropdown with month navigation, past-date disabling, and today highlighting — matching the app's overall design language.

- **Conflict popup UX**: Converted the inline error banner into a full-screen modal popup with backdrop blur, warning icon, and a dismiss button for a much better user experience.

- **Timeline interactivity**: Made timeline booking blocks clickable, opening the same detail modal as list view. Also fixed text truncation in timeline blocks by allowing multi-line wrapping.

- **Attendee capacity validation**: Added real-time validation that warns users when attendee count exceeds the selected room's capacity.

---

## 5. What I Would Verify Before Shipping to Production

- **Cross-browser testing**: Verify the custom DatePicker, TimePicker, and backdrop-filter work on Safari, Firefox, and mobile browsers.

- **Timezone handling**: Currently dates use local timezone via `new Date()` — would need to ensure consistency if users are in different timezones.

- **Concurrent access**: With `localStorage`, two browser tabs could overwrite each other's data. Would need to validate sync behavior.

- **Input sanitization**: Check for XSS via meeting titles or notes fields, especially when rendering user content.

- **Accessibility audit**: Run a proper screen reader test (NVDA/VoiceOver) on the custom pickers to ensure keyboard navigation and ARIA roles are correct.

- **Performance with scale**: Test with 100+ bookings to ensure the timeline view and filtering remain responsive.

---

## 6. What I Would Improve If Given 2 More Days

- **Backend integration**: Replace `localStorage` with a REST API and database (e.g., Node.js + MongoDB) for real multi-user support.

- **Recurring bookings**: Add the ability to book recurring meetings (daily, weekly, monthly) with a single form submission.

- **Drag-and-drop on timeline**: Let users drag to create or resize bookings directly on the timeline view.

- **Email notifications**: Send confirmation emails to organizers and attendees when a booking is created or modified.

- **Dark mode**: The CSS already uses custom properties — would wire up a theme toggle for light/dark modes.

- **Room availability view**: A dedicated screen showing real-time room availability across all rooms for a selected date, making it easier to find open slots.
