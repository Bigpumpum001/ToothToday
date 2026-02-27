import React, { useState, useEffect } from "react";
import {
  DayAvailability,
  MonthAvailability,
  Service,
  SlotStatus,
  ServiceWithContent,
} from "@/types/booking";

interface CalendarProps {
  selectedService?: ServiceWithContent | null;
  onSelectDate: (date: string) => void;
  fetchAvailability: (
    year: number,
    month: number,
  ) => Promise<MonthAvailability>;
}
function Calendar({
  selectedService,
  onSelectDate,
  fetchAvailability,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<MonthAvailability | null>(
    null,
  );
  const [selectedDateLocal, setSelectedDateLocal] = useState<string>("");
  useEffect(() => {
    if (!selectedService) {
      setSelectedDateLocal("");
    } else {
      setSelectedDateLocal("");
    }
  }, [selectedService]);
  const monthStr = `${currentMonth.getFullYear()}-${(
    currentMonth.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}`;

  useEffect(() => {
    const year = currentMonth.getFullYear(),
      month = currentMonth.getMonth() + 1;
    fetchAvailability(year, month).then(setAvailability);
  }, [monthStr, fetchAvailability]);

  const startDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  ).getDay();

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();

  const days: (DayAvailability | null)[] = [];

  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentMonth.getFullYear()}-${(
      currentMonth.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
    const dayAvailability = availability?.days.find(
      (day) => day.date === dateStr,
    );
    days.push({
      date: dateStr,
      slots: dayAvailability?.slots || [],
      status: dayAvailability?.status || "closed",
    });
  }

  const DayClick = (day: DayAvailability | null) => {
    if (!day || !selectedService) return;
    setSelectedDateLocal(day.date);
    onSelectDate(day.date);
  };

  const getDayStatus = (status?: string): SlotStatus => {
    switch (status) {
      case "available":
        return "available";
      case "nearly_full":
        return "nearly_full";
      case "fully_booked":
        return "fully_booked";
      case "closed":
        return "closed";
      default:
        return "closed"; // ปิดทำการ
    }
  };
  const getDayColor = (daystatus: SlotStatus) => {
    switch (daystatus) {
      case "available":
        return "bg-blue-200";
      case "nearly_full":
        return "bg-orange-200";
      case "fully_booked":
        return "bg-red-200";
      case "closed":
        return "bg-gray-200";
      default:
        return "bg-green-200";
    }
  };
  return (
    <>
      <div className="mb-4 flex justify-center gap-4">
        <div className="flex items-center gap-1">
          <span className="block h-4 w-4 bg-blue-200"></span> Available
        </div>
        <div className="flex items-center gap-1">
          <span className="block h-4 w-4 bg-orange-200"></span> Almost Full
        </div>
        <div className="flex items-center gap-1">
          <span className="block h-4 w-4 bg-red-200"></span> Full
        </div>
        <div className="flex items-center gap-1">
          <span className="block h-4 w-4 bg-gray-200"></span> Unavailable
        </div>
      </div>
      <div className="flex items-center justify-between rounded-t-2xl border border-gray-400 bg-blue-200 p-1">
        <button
          className="cursor-pointer text-lg font-medium text-gray-800 hover:text-blue-900"
          type="button"
          onClick={() =>
            setCurrentMonth(
              (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
            )
          }
        >
          &lt; Prev
        </button>
        <h3 className="text-xl font-semibold text-gray-900">
          {currentMonth.toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <button
          className="cursor-pointer text-lg font-medium text-gray-800 hover:text-blue-900"
          type="button"
          onClick={() =>
            setCurrentMonth(
              (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
            )
          }
        >
          Next &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 rounded-b-2xl border border-gray-400 bg-gray-100 p-3 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-lg font-medium">
            {d}
          </div>
        ))}
        {days.map((day, idx) => {
          const isSelected = day?.date === selectedDateLocal;
          return (
            <div className="flex items-center justify-center" key={idx}>
              {day ? (
                <button
                  type="button"
                  className={`flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-4xl border border-gray-400 p-1 transition ${day ? getDayColor(getDayStatus(day.status)) : "bg-transparent"} ${
                    isSelected ? "ring-2 ring-blue-900" : ""
                  } hover:ring-2 hover:ring-blue-300`}
                  onClick={() => DayClick(day)}
                  disabled={
                    !selectedService ||
                    getDayStatus(day?.status) === "fully_booked" ||
                    getDayStatus(day?.status) === "closed"
                  }
                >
                  {day && (
                    <div>
                      {day && (
                        <span
                          className={`text-lg font-extralight text-gray-900 ${
                            isSelected ? "text-xl text-blue-700" : ""
                          }`}
                        >
                          {day.date.split("-")[2]}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              ) : (
                <div className="h-full w-full"></div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Calendar;
