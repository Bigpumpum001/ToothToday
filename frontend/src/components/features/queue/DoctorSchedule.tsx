import React, { useState, useEffect } from "react";
import { Slot } from "@/types/booking";
import api from "@/lib/api";
function DoctorSchedule() {
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-CA"); // YYYY-MM-DD
  // console.log("today",today.toLocaleDateString('en-CA'))

  const [date, setDate] = useState(todayStr);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchSlots = async (d: string) => {
      setLoading(true);
      try {
        const res = await api.get(`/appointment/availability/day?date=${d}`);
        setSlots(res.data);
        // console.log("Slots",res.data)
      } catch (err) {
        console.error(err);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots(date);
  }, [date]);

  function prevDay() {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    setDate(d.toLocaleDateString("en-CA"));
  }

  function nextDay() {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    setDate(d.toLocaleDateString("en-CA"));
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "available":
        return "bg-blue-200 text-blue-900";
      case "booked":
        return "bg-red-200 text-red-800";
      case "passed":
        return "bg-gray-200 text-gray-600";
      default:
        return "";
    }
  }
  return (
    <div className="mx-auto max-w-5xl ps-6 pe-6">
      <div className="mb-4 flex items-center justify-center gap-3">
        <button
          onClick={prevDay}
          className={`rounded-xl border border-gray-400 bg-gray-200 px-3 py-2 ${
            date <= todayStr
              ? "cursor-not-allowed text-white"
              : "hover:bg-gray-300"
          }`}
          disabled={date <= todayStr}
        >
          &lt; Prev day
        </button>
        <input
          type="date"
          value={date}
          min={todayStr}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-2xl border border-gray-400 p-2"
        />
        <button
          onClick={nextDay}
          className="rounded-xl border border-gray-400 bg-gray-200 px-3 py-2 hover:bg-gray-300"
        >
          Next day &gt;
        </button>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div>
          {slots.length === 0 ? (
            <div>No slots for this day</div>
          ) : (
            <ul className="grid gap-x-4 md:grid-cols-2">
              {slots.map((s: Slot) => (
                <div className="flex" key={s.time}>
                  <li
                    className={`mb-3 flex-grow rounded-lg border border-gray-400 p-3 ${getStatusColor(
                      s.status,
                    )}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-medium">{s.time}</div>
                      <div className="text-sm">
                        {s.status === "available"
                          ? "ว่าง"
                          : s.status === "booked"
                            ? "มีคิว"
                            : s.status === "passed"
                              ? "ผ่านไปแล้ว"
                              : ""}
                      </div>
                    </div>
                    <div className="mt-2">
                      {s.doctors?.map((d, idx) => (
                        <div key={idx} className="text-sm">
                          {d.name}
                          {" — "}
                          {/* {d.specialization}  */}
                          {d.service ? `(${d.service}, ${d.start} )` : ""}
                        </div>
                      ))}
                    </div>
                  </li>
                </div>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default DoctorSchedule;
