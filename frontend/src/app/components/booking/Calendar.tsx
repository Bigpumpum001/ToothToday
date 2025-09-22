import React, { useState, useEffect } from "react";
import {
  DayAvailability,
  MonthAvailability,
  Service,
  SlotStatus,
} from "@/app/types/booking";
import { time } from "console";

interface CalendarProps {
  selectedService?: Service | null;
  onSelectDate: (date: string) => void;
  fetchAvailability: (
    year: number,
    month: number
  ) => Promise<MonthAvailability>;
}
function Calendar2({
  selectedService,
  onSelectDate,
  fetchAvailability,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<MonthAvailability | null>(
    null
  );
  const [selectedDateLocal, setSelectedDateLocal] = useState<string>("");
  useEffect(() => {
    if (!selectedService) {
      setSelectedDateLocal("");
    } else {
      setSelectedDateLocal("");
    }
  }, [selectedService]);

  useEffect(() => {
    const year = currentMonth.getFullYear(),
      month = currentMonth.getMonth() + 1;
    fetchAvailability(year, month).then(setAvailability);
  }, [currentMonth, fetchAvailability]);

  const startDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
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
      (day) => day.date === dateStr
    );
    days.push({
      date: dateStr,
      slots: dayAvailability?.slots || [],
      status: dayAvailability?.status || "closed",
    });
  }

  const handleClickDay = (day: DayAvailability | null) => {
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
        return "closed"; // fallback เป็นปิดทำการ
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
      <div className="flex justify-center gap-4 mb-4">
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 bg-blue-200 block"></span> Available
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 bg-orange-200 block"></span> Almost Full
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 bg-red-200 block"></span> Full
        </div>
        <div className="flex items-center gap-1">
          <span className="w-4 h-4 bg-gray-200 block"></span> Unavailable
        </div>
      </div>
      <div className="flex justify-between items-center  border border-gray-400 rounded-t-2xl p-1 bg-blue-200">
        <button
          className="cursor-pointer font-medium text-lg text-gray-800 hover:text-blue-900 "
          type="button"
          onClick={() =>
            setCurrentMonth(
              (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
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
          className="cursor-pointer font-medium text-lg text-gray-800 hover:text-blue-900 "
          type="button"
          onClick={() =>
            setCurrentMonth(
              (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
            )
          }
        >
          Next &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center border border-gray-400 rounded-b-2xl p-3 bg-gray-100">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="font-medium text-lg">
            {d}
          </div>
        ))}
        {days.map((day, idx) => {
          const isSelected = day?.date === selectedDateLocal;
          return (
            <div className="flex justify-center items-center" key={idx}>
              {day ? (
                <button
                  type="button"
                  className={`border border-gray-400 rounded-4xl h-full w-full  p-1 flex flex-col justify-center items-center cursor-pointer transition
           ${day ? getDayColor(getDayStatus(day.status)) : "bg-transparent"}
          ${
            isSelected ? "ring-2 ring-blue-900" : ""
          } hover:ring-2 hover:ring-blue-300
          `}
                  onClick={() => handleClickDay(day)}
                  disabled={
                    !selectedService ||
                    getDayStatus(day?.status) === "fully_booked" ||
                    getDayStatus(day?.status) === "closed"
                  }
                >
                  {day && (
                    <div
                    >
                      {day && (
                        <span
                          className={`font-extralight text-lg text-gray-900 ${
                            isSelected ? "text-blue-700 text-xl" : ""
                          }`}
                        >
                          {day.date.split("-")[2]}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              ) : (
                <div className="w-full h-full"></div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Calendar2;
