"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import Swal from "sweetalert2";
import Image from "next/image";
import { AppointmentForAdmin } from "@/types/booking";
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
    new Date().toISOString().split("T")[0],
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
      // console.log(res.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      Swal.fire("ผิดพลาด", "ไม่สามารถโหลดข้อมูลคิวได้", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedAppointment) return;
    // console.log(newStatus);
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
        await api.delete(`/appointments/${id}/delete`, {});
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
    return <div className="py-8 text-center">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Appointments List */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex justify-between">
          <div className="mb-4 flex items-center sm:flex-row">
            <h3 className="font-semibold text-blue-900 sm:text-xl">
              รายการคิว {""}(
              {appointments && appointments.length > 0
                ? appointments.length
                : 0}{" "}
              คิว)
            </h3>
          </div>
          <div className="hidden sm:flex">
            <h3 className="mt-2 font-semibold sm:text-xl">
              {formatDate(selectedDate)}
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="flex sm:hidden">
              <h3 className="mt-2 font-semibold sm:text-xl">
                {formatDate(selectedDate)}
              </h3>
            </div>
            <div className="flex flex-row items-center justify-between gap-1">
              <button
                onClick={() => navigateDate("prev")}
                className="rounded-lg bg-gray-200 px-3 py-2 text-sm hover:bg-gray-300 sm:px-4"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="rounded-lg bg-slate-300 px-3 py-2 text-sm text-white hover:bg-blue-700 sm:px-4"
                  >
                    <Calendar className="h-4 w-4 text-blue-900" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => navigateDate("next")}
                className="rounded-lg bg-gray-200 px-3 py-2 text-sm hover:bg-gray-300 sm:px-4"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Calendar Popup */}
            {showCalendar && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-lg border bg-white p-4 shadow-lg">
                  <div className="mb-4 flex items-center justify-between">
                    <button
                      onClick={() => navigateMonth("prev")}
                      className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
                    >
                      <ChevronLeft />
                    </button>
                    <h4 className="font-semibold">{currentMonth}</h4>
                    <button
                      onClick={() => navigateMonth("next")}
                      className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
                    >
                      <ChevronRight />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((day) => (
                      <div
                        key={day}
                        className="p-2 font-semibold text-gray-600"
                      >
                        {day}
                      </div>
                    ))}

                    {daysInMonth.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => day && handleDateSelect(day)}
                        disabled={!day}
                        className={`rounded p-2 transition-colors hover:bg-blue-100 ${
                          !day
                            ? "cursor-not-allowed text-gray-300"
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
                      className="rounded bg-gray-200 p-2 hover:bg-gray-300"
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
          <div className="py-8 text-center text-gray-500">ไม่มีคิวในวันนี้</div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-b-slate-400">
                    <th className="p-2 text-left">เวลา</th>
                    <th className="p-2 text-left">ผู้ป่วย</th>
                    <th className="p-2 text-left">แพทย์</th>
                    <th className="p-2 text-left">บริการ</th>
                    <th className="p-2 text-left">สถานะ</th>
                    <th className="p-2 text-left">จัดการ</th>
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
                          <div className="max-w-xs truncate text-sm text-gray-600">
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
                          className={`rounded-lg px-2 py-1 text-sm font-medium bg-${getStatusColor(appointment.status)}-200 text-${getStatusColor(appointment.status)}-800 `}
                        >
                          {getStatusLabel(appointment.status)}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openStatusModal(appointment)}
                            className="rounded bg-blue-800 px-3 py-1 text-sm text-white hover:bg-blue-900"
                          >
                            แก้ไขสถานะ
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteAppointment(appointment.id)
                            }
                            className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
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
            <div className="space-y-4 lg:hidden">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`rounded-lg border p-4 shadow-sm ${
                    isPastAppointment(appointment.appointment_time)
                      ? "border-gray-200 bg-gray-50"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {/* Time and Status */}
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="text-lg font-semibold">
                        {formatTime(appointment.appointment_time)}
                      </div>
                      {isPastAppointment(appointment.appointment_time) && (
                        <span className="text-xs text-red-600">ผ่านไปแล้ว</span>
                      )}
                    </div>
                    <span
                      className={`rounded-lg px-2 py-1 text-xs font-medium bg-${getStatusColor(appointment.status)}-200 text-${getStatusColor(appointment.status)}-800 `}
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
                      <div className="mt-1 text-sm text-gray-600">
                        หมายเหตุ: {appointment.note}
                      </div>
                    )}
                  </div>

                  {/* Doctor and Service */}
                  <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
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
                      className="flex-1 rounded bg-blue-800 px-3 py-2 text-sm text-white hover:bg-blue-900"
                    >
                      แก้ไขสถานะ
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="flex-1 rounded bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600"
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
          className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-slate-800/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowStatusModal(false);
              setSelectedAppointment(null);
              setNewStatus("");
            }
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white">
            <div className="border-b border-b-slate-300 p-4 md:p-6">
              <h3 className="text-xl font-semibold text-blue-900">
                แก้ไขสถานะคิว
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="mb-2 font-medium text-blue-900">
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
                        "/images/appointment",
                      ) ? (
                        <p>
                          <span className="font-medium">รูปฟันที่แนบมา</span>{" "}
                          <div className="relative flex w-full items-center justify-center">
                            <Image
                              src={
                                "https://storage.googleapis.com/toothtoday-bucket" +
                                selectedAppointment.image_url
                              }
                              alt={selectedAppointment.service_name}
                              width={150}
                              height={150}
                              className="object-contain"
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
                  <label className="mb-1 block text-sm font-medium">
                    สถานะใหม่
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full rounded border border-slate-200 p-2"
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

            <div className="border-t border-t-slate-300 bg-gray-50 p-4 md:p-6">
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedAppointment(null);
                    setNewStatus("");
                  }}
                  className="rounded border border-slate-300 bg-slate-200 px-4 py-2 hover:bg-slate-300"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleStatusChange}
                  className="rounded bg-blue-800 px-4 py-2 text-white hover:bg-blue-900"
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
