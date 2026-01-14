"use client";
import { useState, useEffect } from "react";
import api from "@/app/lib/api";
import Swal from "sweetalert2";
import Image from "next/image";
import { AppointmentForAdmin } from "@/app/types/booking";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
const statusOptions = [
  { value: "pending", label: "รอดำเนินการ", color: "yellow" },
  { value: "confirm", label: "ยืนยันแล้ว", color: "blue" },
  { value: "in_progress", label: "กำลังดำเนินการ", color: "orange" },
  { value: "complete", label: "เสร็จสิ้น", color: "green" },
  // { value: "cancelled", label: "ยกเลิก", color: "red" },
  { value: "no_show", label: "ไม่ได้เข้าร่วม", color: "gray" },
];

export default function AppointmentsManagement() {
  const [appointments, setAppointments] = useState<AppointmentForAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentForAdmin | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(day);
    setSelectedDate(formatDateForInput(newDate));
    setShowCalendar(false);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const dateObj = new Date(selectedDate);
    if (direction === "prev") {
      dateObj.setMonth(dateObj.getMonth() - 1);
    } else {
      dateObj.setMonth(dateObj.getMonth() + 1);
    }
    setSelectedDate(formatDateForInput(dateObj));
  };

  const currentDateObj = new Date(selectedDate);
  const currentMonth = currentDateObj.toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = getDaysInMonth(currentDateObj);
  const currentDay = currentDateObj.getDate();

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/appointments?date=${selectedDate}`);
      setAppointments(res.data);
      console.log(res.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      Swal.fire("ผิดพลาด", "ไม่สามารถโหลดข้อมูลคิวได้", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedAppointment) return;
    console.log(newStatus);
    try {
      await api.put(`/appointments/${selectedAppointment.id}`, {
        status: newStatus,
      });

      Swal.fire("สำเร็จ", "อัปเดตสถานะสำเร็จ", "success");
      setShowStatusModal(false);
      setSelectedAppointment(null);
      setNewStatus("");
      fetchAppointments();
    } catch (error) {
      console.error("Error updating status:", error);
      Swal.fire("ผิดพลาด", "ไม่สามารถอัปเดตสถานะได้", "error");
    }
  };

  const handleDeleteAppointment = async (id: number) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณต้องการลบคิวนี้ใช่หรือไม่",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        await api.post(`/appointments/${id}/delete`, {});
        Swal.fire("สำเร็จ", "ลบคิวสำเร็จ", "success");
        fetchAppointments();
      } catch (error) {
        console.error("Error deleting appointment:", error);
        Swal.fire("ผิดพลาด", "ไม่สามารถลบคิวได้", "error");
      }
    }
  };

  const openStatusModal = (appointment: AppointmentForAdmin) => {
    setSelectedAppointment(appointment);
    setNewStatus(appointment.status);
    setShowStatusModal(true);
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find((opt) => opt.value === status);
    return statusOption ? statusOption.color : "gray";
  };

  const getStatusLabel = (status: string) => {
    const statusOption = statusOptions.find((opt) => opt.value === status);
    return statusOption ? statusOption.label : status;
  };

  const isPastAppointment = (appointmentTime: string) => {
    return new Date(appointmentTime) < new Date();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const navigateDate = (direction: "prev" | "next") => {
    const currentDate = new Date(selectedDate);
    if (direction === "prev") {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setSelectedDate(currentDate.toISOString().split("T")[0]);
  };

  if (loading) {
    return <div className="text-center py-8">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between mb-4">
          <div className="flex sm:flex-row items-center mb-4 ">
            <h3 className="sm:text-xl font-semibold text-blue-900">
              รายการคิว {""}(
              {appointments && appointments.length > 0
                ? appointments.length
                : 0}{" "}
              คิว)
            </h3>
          </div>
          <div className="hidden sm:flex">
            <h3 className="sm:text-xl font-semibold mt-2">
              {formatDate(selectedDate)}
            </h3>
          </div>
          <div className=" flex flex-col items-center justify-center">
            <div className="sm:hidden flex">
              <h3 className="sm:text-xl font-semibold mt-2">
                {formatDate(selectedDate)}
              </h3>
            </div>
            <div className="flex flex-row items-center justify-between gap-1">
              <button
                onClick={() => navigateDate("prev")}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm sm:px-4"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="px-3 py-2 bg-slate-300 text-white rounded-lg hover:bg-blue-700 text-sm sm:px-4"
                  >
                    <Calendar className="text-blue-900 h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => navigateDate("next")}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm sm:px-4"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Calendar Popup */}
            {showCalendar && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 ">
                <div className="bg-white border rounded-lg shadow-lg p-4 w-full max-w-sm max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => navigateMonth("prev")}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                    >
                      <ChevronLeft />
                    </button>
                    <h4 className="font-semibold">{currentMonth}</h4>
                    <button
                      onClick={() => navigateMonth("next")}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                    >
                      <ChevronRight />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((day) => (
                      <div
                        key={day}
                        className="font-semibold p-2 text-gray-600"
                      >
                        {day}
                      </div>
                    ))}

                    {daysInMonth.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => day && handleDateSelect(day)}
                        disabled={!day}
                        className={`p-2 rounded hover:bg-blue-100 transition-colors ${
                          !day
                            ? "text-gray-300 cursor-not-allowed"
                            : day === currentDay
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "hover:bg-blue-100"
                        }`}
                      >
                        {day || ""}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setShowCalendar(false)}
                      className="p-2 bg-gray-200 hover:bg-gray-300 rounded"
                    >
                      <X />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {!appointments || appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">ไม่มีคิวในวันนี้</div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-b-slate-400">
                    <th className="text-left p-2">เวลา</th>
                    <th className="text-left p-2">ผู้ป่วย</th>
                    <th className="text-left p-2">แพทย์</th>
                    <th className="text-left p-2">บริการ</th>
                    <th className="text-left p-2">สถานะ</th>
                    <th className="text-left p-2">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className={`border-b border-b-slate-300 hover:bg-gray-50 ${
                        isPastAppointment(appointment.appointment_time)
                          ? "bg-gray-50"
                          : ""
                      }`}
                    >
                      <td className="p-2">
                        <div>
                          <div className="font-medium">
                            {formatTime(appointment.appointment_time)}
                          </div>
                          {isPastAppointment(appointment.appointment_time) && (
                            <span className="text-xs text-red-600">
                              ผ่านไปแล้ว
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="font-medium">
                          {appointment.user_name ||
                            `User name: ${appointment.user_name}`}
                        </div>
                        {appointment.note && (
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            หมายเหตุ: {appointment.note}
                          </div>
                        )}
                      </td>
                      <td className="p-2">{appointment.doctor_name}</td>
                      <td className="p-2">
                        <div>{appointment.service_name}</div>
                        <div className="text-sm text-gray-600">
                          {appointment.duration_minutes} นาที
                        </div>
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-lg text-sm font-medium
                          bg-${getStatusColor(appointment.status)}-200 
                          text-${getStatusColor(appointment.status)}-800
                        `}
                        >
                          {getStatusLabel(appointment.status)}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openStatusModal(appointment)}
                            className="bg-blue-800 text-white px-3 py-1 rounded text-sm hover:bg-blue-900"
                          >
                            แก้ไขสถานะ
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteAppointment(appointment.id)
                            }
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`border rounded-lg p-4 shadow-sm ${
                    isPastAppointment(appointment.appointment_time)
                      ? "bg-gray-50 border-gray-200"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {/* Time and Status */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-lg">
                        {formatTime(appointment.appointment_time)}
                      </div>
                      {isPastAppointment(appointment.appointment_time) && (
                        <span className="text-xs text-red-600">ผ่านไปแล้ว</span>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium
                        bg-${getStatusColor(appointment.status)}-200 
                        text-${getStatusColor(appointment.status)}-800
                      `}
                    >
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>

                  {/* Patient Info */}
                  <div className="mb-3">
                    <div className="font-medium text-blue-900">
                      {appointment.user_name ||
                        `User name: ${appointment.user_name}`}
                    </div>
                    {appointment.note && (
                      <div className="text-sm text-gray-600 mt-1">
                        หมายเหตุ: {appointment.note}
                      </div>
                    )}
                  </div>

                  {/* Doctor and Service */}
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <span className="text-gray-600">แพทย์:</span>
                      <div className="font-medium">
                        {appointment.doctor_name}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">ระยะเวลา:</span>
                      <div className="font-medium">
                        {appointment.duration_minutes} นาที
                      </div>
                    </div>
                  </div>

                  {/* Service Name */}
                  <div className="mb-4 text-sm">
                    <span className="text-gray-600">บริการ:</span>
                    <div className="font-medium">
                      {appointment.service_name}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openStatusModal(appointment)}
                      className="flex-1 bg-blue-800 text-white px-3 py-2 rounded text-sm hover:bg-blue-900"
                    >
                      แก้ไขสถานะ
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Change Modal */}
      {showStatusModal && selectedAppointment && (
        <div
          className="fixed inset-0 bg-slate-800/50 bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowStatusModal(false);
              setSelectedAppointment(null);
              setNewStatus("");
            }
          }}
        >
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 md:p-6 border-b border-b-slate-300">
              <h3 className="text-xl font-semibold text-blue-900">
                แก้ไขสถานะคิว
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-900">
                    ข้อมูลนัดหมาย
                  </h4>
                  <div className="grid grid-cols-2">
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">ผู้ป่วย:</span>{" "}
                        {selectedAppointment.user_name ||
                          `User ID: ${selectedAppointment.user_name}`}
                      </p>
                      <p>
                        <span className="font-medium">แพทย์:</span>{" "}
                        {selectedAppointment.doctor_name}
                      </p>
                      <p>
                        <span className="font-medium">บริการ:</span>{" "}
                        {selectedAppointment.service_name}
                      </p>
                      <p>
                        <span className="font-medium">เวลา:</span>{" "}
                        {formatDate(selectedAppointment.appointment_time)}{" "}
                        {formatTime(selectedAppointment.appointment_time)}
                      </p>
                      <p>
                        <span className="font-medium">ระยะเวลา:</span>{" "}
                        {selectedAppointment.time_range}
                      </p>

                      {selectedAppointment.image_url && (
                        <p>
                          <span className="font-medium">หมายเหตุ:</span>{" "}
                          {selectedAppointment.note}
                        </p>
                      )}
                    </div>
                    <div className="text-center">
                      {selectedAppointment.image_url &&
                      selectedAppointment.image_url !== "" &&
                      selectedAppointment.image_url.includes(
                        "/images/appointment"
                      ) ? (
                        <p>
                          <span className="font-medium ">รูปฟันที่แนบมา</span>{" "}
                          <div className="relative w-full flex items-center justify-center">
                            <Image
                              src={"https://storage.googleapis.com/toothtoday-bucket"+selectedAppointment.image_url}
                              alt={selectedAppointment.service_name}
                              width={150}
                              height={150}
                              className="object-contain "
                            />
                          </div>
                        </p>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    สถานะใหม่
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-t-slate-300 bg-gray-50">
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedAppointment(null);
                    setNewStatus("");
                  }}
                  className="px-4 py-2 border border-slate-300 bg-slate-200 rounded hover:bg-slate-300"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleStatusChange}
                  className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900"
                >
                  อัปเดตสถานะ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
