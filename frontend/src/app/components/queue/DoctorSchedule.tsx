import React, { useState, useEffect } from "react";
import { Slot } from "@/app/types/booking";
import api from "@/app/lib/api";
function DoctorSchedule() {
  const today = new Date();
  // console.log("today",today.toLocaleDateString('en-CA'))
  const todayStr = today.toLocaleDateString("en-CA"); // YYYY-MM-DD

  const [date, setDate] = useState(todayStr);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchSlots = async (d: string) => {
      setLoading(true);
      try {
        const res = await api.get(`/appointment/availability/day?date=${d}`);
        setSlots(res.data);
        // console.log("sl",res.data)
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
    <div className="ps-6 pe-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-4 justify-center">
        <button
          onClick={prevDay}
          className={`px-3 py-2 rounded-xl bg-gray-200 ${
            date <= todayStr
              ? "text-white cursor-not-allowed"
              : " hover:bg-gray-300"
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
          className="p-2 border border-gray-400 rounded-2xl"
        />
        <button
          onClick={nextDay}
          className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
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
            <ul className="grid md:grid-cols-2 gap-x-4">
              {slots.map((s: Slot) => (
                <div className="flex" key={s.time}>
                  <li
                    className={`mb-3 p-3 rounded-xl flex-grow ${getStatusColor(
                      s.status
                    )}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-xl font-medium">{s.time}</div>
                      <div className="text-sm">
                        {s.status === "available"
                          ? "ว่าง"
                          : s.status === "booked"
                          ? "มีคิว"
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
