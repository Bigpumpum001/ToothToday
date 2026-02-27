"use client";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import Swal from "sweetalert2";
import Image from "next/image";
import { Pencil, Trash } from "lucide-react";

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  schedule: string;
  image_url: string;
}

interface DoctorSchedule {
  id: number;
  doctor_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_interval: number;
}

const dayNames = [
  "อาทิตย์",
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัสบดี",
  "ศุกร์",
  "เสาร์",
];

export default function DoctorsManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<DoctorSchedule | null>(
    null,
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortByDay, setSortByDay] = useState<number | null>(null);

  // Form states
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    specialization: "",
    schedule: "",
  });

  const [scheduleForm, setScheduleForm] = useState({
    doctor_id: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
    slot_interval: "60",
  });

  useEffect(() => {
    fetchDoctors();
    fetchSchedules();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      Swal.fire("ผิดพลาด", "ไม่สามารถโหลดข้อมูลแพทย์ได้", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await api.get("/doctors/schedules");
      setSchedules(res.data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", doctorForm.name);
      formData.append("specialization", doctorForm.specialization);
      formData.append("schedule", doctorForm.schedule);

      if (file) {
        formData.append("file", file);
      }
      // console.log("doctorForm", doctorForm);
      if (editingDoctor) {
        await api.put(`/doctors/${editingDoctor.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("สำเร็จ", "อัปเดตข้อมูลแพทย์สำเร็จ", "success");
      } else {
        await api.post("/doctors", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("สำเร็จ", "เพิ่มแพทย์สำเร็จ", "success");
      }

      resetDoctorForm();
      fetchDoctors();
    } catch (error) {
      console.error("Error saving doctor:", error);
      Swal.fire("ผิดพลาด", "ไม่สามารถบันทึกข้อมูลแพทย์ได้", "error");
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const doctorId = parseInt(scheduleForm.doctor_id);
      const dayOfWeek = parseInt(scheduleForm.day_of_week);
      const startTime = scheduleForm.start_time;
      const endTime = scheduleForm.end_time;

      // Validate time inputs
      if (!doctorId || dayOfWeek === null || !startTime || !endTime) {
        Swal.fire("ผิดพลาด", "กรุณากรอกข้อมูลให้ครบถ้วน", "error");
        return;
      }
      // console.log("scheduleForm", startTime);
      // console.log("scheduleForm", endTime);
      // console.log("tt", Number(startTime) - Number(endTime));

      // Check if start time is before or equal to end time
      if (Number(startTime) >= Number(endTime)) {
        Swal.fire("ผิดพลาด", "เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด", "error");
        return;
      }

      // Check for time conflicts
      const hasTimeConflict = checkTimeConflict(
        startTime,
        endTime,
        doctorId,
        dayOfWeek,
        editingSchedule?.id,
      );

      if (hasTimeConflict) {
        Swal.fire(
          "ผิดพลาด",
          "ช่วงเวลาที่เลือกซ้ำกับเวลาทำงานที่มีอยู่แล้ว",
          "error",
        );
        return;
      }

      const scheduleData = {
        doctor_id: doctorId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        slot_interval: parseInt(scheduleForm.slot_interval),
      };
      // console.log("scheduleData", scheduleData);
      if (editingSchedule) {
        await api.put(
          `/doctors/schedules/${editingSchedule.id}`,
          scheduleData,
          {
            // headers: { "Content-Type": "multipart/form-data" },
          },
        );
        Swal.fire("สำเร็จ", "อัปเดตตารางเวลาสำเร็จ", "success");
      } else {
        await api.post("/doctors/schedules", scheduleData, {
          // headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("สำเร็จ", "เพิ่มตารางเวลาสำเร็จ", "success");
      }

      resetScheduleForm();
      fetchSchedules();
    } catch (error) {
      console.error("Error saving schedule:", error);
      Swal.fire("ผิดพลาด", "ไม่สามารถบันทึกตารางเวลาได้", "error");
    }
  };

  const handleDeleteDoctor = async (id: number) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณต้องการลบแพทย์คนนี้ใช่หรือไม่",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        await api.post(
          `/doctors/${id}/delete`,
          {},
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        Swal.fire("สำเร็จ", "ลบแพทย์สำเร็จ", "success");
        fetchDoctors();
      } catch (error) {
        console.error("Error deleting doctor:", error);
        Swal.fire("ผิดพลาด", "ไม่สามารถลบแพทย์ได้", "error");
      }
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณต้องการลบตารางเวลานี้ใช่หรือไม่",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        await api.post(
          `/doctors/schedules/${id}/delete`,
          {},
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        Swal.fire("สำเร็จ", "ลบตารางเวลาสำเร็จ", "success");
        fetchSchedules();
      } catch (error) {
        console.error("Error deleting schedule:", error);
        Swal.fire("ผิดพลาด", "ไม่สามารถลบตารางเวลาได้", "error");
      }
    }
  };

  const editDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setDoctorForm({
      name: doctor.name,
      specialization: doctor.specialization,
      schedule: doctor.schedule,
    });
    setShowDoctorForm(true);
  };

  const editSchedule = (schedule: DoctorSchedule) => {
    setEditingSchedule(schedule);

    // Format time to ensure it matches the dropdown format (HH:00:00)
    const formatTimeForDropdown = (time: string) => {
      if (!time) return "";
      const [hours] = time.split(":");
      const hourInt = parseInt(hours);
      if (isNaN(hourInt)) return "";
      return `${hourInt.toString().padStart(2, "0")}:00:00`;
    };

    setScheduleForm({
      doctor_id: schedule.doctor_id.toString(),
      day_of_week: schedule.day_of_week.toString(),
      start_time: formatTimeForDropdown(schedule.start_time),
      end_time: formatTimeForDropdown(schedule.end_time),
      slot_interval: schedule.slot_interval.toString(),
    });
    setShowScheduleForm(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelNewImage = () => {
    setFile(null);
    setPreviewUrl("");
  };

  const resetDoctorForm = () => {
    setDoctorForm({
      name: "",
      specialization: "",
      schedule: "",
    });
    setFile(null);
    setPreviewUrl("");
    setEditingDoctor(null);
    setShowDoctorForm(false);
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      doctor_id: "",
      day_of_week: "",
      start_time: "",
      end_time: "",
      slot_interval: "60",
    });
    setEditingSchedule(null);
    setShowScheduleForm(false);
  };

  const getDoctorName = (doctorId: number) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor ? doctor.name : "ไม่พบแพทย์";
  };

  // Helper function to format time from HH:MM:SS.000000 to HH:MM
  const formatTime = (time: string) => {
    if (!time) return "";
    // Split by : and take first two parts (HH:MM)
    const [hours, minutes] = time.split(":");
    return `${hours}:${minutes}`;
  };

  // Filter and sort functions
  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredSchedules = schedules
    .filter((schedule) => {
      const matchesSearch = getDoctorName(schedule.doctor_id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDay =
        sortByDay === null || schedule.day_of_week === sortByDay;
      return matchesSearch && matchesDay;
    })
    .sort((a, b) => {
      if (
        sortByDay !== null &&
        a.day_of_week === sortByDay &&
        b.day_of_week === sortByDay
      ) {
        return a.start_time.localeCompare(b.start_time);
      }
      return a.day_of_week - b.day_of_week;
    });

  // Check for time conflicts
  const checkTimeConflict = (
    newStart: string,
    newEnd: string,
    doctorId: number,
    dayOfWeek: number,
    excludeId?: number,
  ) => {
    return schedules.some((schedule) => {
      if (excludeId && schedule.id === excludeId) return false;
      if (schedule.doctor_id !== doctorId) return false;
      if (schedule.day_of_week !== dayOfWeek) return false;

      const existingStart = schedule.start_time;
      const existingEnd = schedule.end_time;

      return newStart < existingEnd && newEnd > existingStart;
    });
  };

  // Close modal when clicking outside
  const handleModalBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      resetDoctorForm();
      resetScheduleForm();
    }
  };

  if (loading) {
    return <div className="py-8 text-center">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Doctors Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-blue-900">จัดการแพทย์</h3>
          <button
            onClick={() => setShowDoctorForm(true)}
            className="rounded bg-blue-800 px-4 py-2 text-white hover:bg-blue-900"
          >
            + เพิ่มแพทย์
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหาแพทย์หรือความเชี่ยวชาญ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <svg
              className="absolute top-3.5 left-3 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Card View - Responsive Design */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Image Section */}
              {doctor.image_url &&
              doctor.image_url !== "" &&
              doctor.image_url.includes("toothtoday-bucket/images/doctors") ? (
                <div className="relative h-48 w-full md:h-56 lg:h-64">
                  <Image
                    src={doctor.image_url}
                    alt={doctor.name}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="relative h-48 w-full md:h-56 lg:h-64">
                  <Image
                    src={"/images/services-pic/no_image_available.jpg"}
                    alt={doctor.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}

              {/* Content Section */}
              <div className="flex flex-grow flex-col p-4 md:p-5">
                <h4 className="mb-2 flex-grow text-sm font-bold text-blue-900 sm:text-xl">
                  {doctor.name}
                </h4>
                <p className="mb-4 text-sm text-gray-600 md:text-base">
                  {doctor.specialization}
                </p>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => editDoctor(doctor)}
                    className="flex flex-1 justify-center rounded bg-yellow-500 p-1 text-sm text-white transition-colors hover:bg-yellow-600 md:text-base"
                  >
                    <Pencil />
                  </button>
                  <button
                    onClick={() => handleDeleteDoctor(doctor.id)}
                    className="flex flex-1 justify-center rounded bg-red-500 p-1 text-sm text-white transition-colors hover:bg-red-600 md:text-base"
                  >
                    <Trash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedules Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between space-y-0">
          <h3 className="text-2xl font-semibold text-blue-900">
            จัดการตารางเวลาทำงาน
          </h3>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => setShowScheduleForm(true)}
              className="rounded bg-green-700 px-4 py-2 text-white hover:bg-green-700"
            >
              + เพิ่มตารางเวลา
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ค้นหาแพทย์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 p-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <svg
              className="absolute top-3.5 left-3 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <select
            value={sortByDay?.toString() || ""}
            onChange={(e) =>
              setSortByDay(e.target.value ? parseInt(e.target.value) : null)
            }
            className="rounded-lg border border-slate-200 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">ทุกวัน</option>
            {dayNames.map((day, index) => (
              <option key={index} value={index}>
                {day}
              </option>
            ))}
          </select>
        </div>

        {/* Responsive Schedule Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-400 text-blue-900">
                <th className="p-2 text-left">แพทย์</th>
                <th className="p-2 text-left">วัน</th>
                <th className="p-2 text-left">เวลาเริ่ม</th>
                <th className="p-2 text-left">เวลาสิ้นสุด</th>
                {/* <th className="text-left p-2">ช่วงเวลา (นาที)</th> */}
                <th className="p-2 text-left">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((schedule) => (
                <tr
                  key={schedule.id}
                  className="border-b border-slate-200 hover:bg-gray-50"
                >
                  <td className="p-2">{getDoctorName(schedule.doctor_id)}</td>
                  <td className="p-2">{dayNames[schedule.day_of_week]}</td>
                  <td className="p-2">{formatTime(schedule.start_time)}</td>
                  <td className="p-2">{formatTime(schedule.end_time)}</td>
                  {/* <td className="p-2">{schedule.slot_interval}</td> */}
                  <td className="flex gap-1 p-2">
                    <button
                      onClick={() => editSchedule(schedule)}
                      className="mr-2 flex w-full items-center justify-center rounded bg-yellow-500 py-1 text-white hover:bg-yellow-600"
                    >
                      <Pencil />
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className="flex w-full items-center justify-center rounded bg-red-500 text-white hover:bg-red-600"
                    >
                      <Trash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Doctor Form Modal */}
      {showDoctorForm && (
        <div
          className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-slate-800/50 p-4"
          onClick={handleModalBackdropClick}
        >
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white">
            <div className="border-b border-b-slate-300 p-4 md:p-6">
              <h3 className="text-xl font-semibold">
                {editingDoctor ? "แก้ไขข้อมูลแพทย์" : "เพิ่มแพทย์ใหม่"}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <form id="doctorForm" onSubmit={handleDoctorSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      ชื่อแพทย์
                    </label>
                    <input
                      type="text"
                      required
                      value={doctorForm.name}
                      onChange={(e) =>
                        setDoctorForm({ ...doctorForm, name: e.target.value })
                      }
                      className="w-full rounded border border-slate-300 p-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      ความเชี่ยวชาญ
                    </label>
                    <input
                      type="text"
                      required
                      value={doctorForm.specialization}
                      onChange={(e) =>
                        setDoctorForm({
                          ...doctorForm,
                          specialization: e.target.value,
                        })
                      }
                      className="w-full rounded border border-slate-300 p-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      ตารางเวลาเข้าเวรแพทย์
                      (ใช้สำหรับการจัดตารางและอ้างอิงในอนาคต)
                    </label>
                    <textarea
                      value={doctorForm.schedule}
                      onChange={(e) =>
                        setDoctorForm({
                          ...doctorForm,
                          schedule: e.target.value,
                        })
                      }
                      className="w-full rounded border border-slate-300 p-2"
                      rows={3}
                      placeholder="ข้อมูลเพิ่มเติมเกี่ยวกับแพทย์"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      รูปภาพแพทย์
                    </label>

                    {/* Preview รูปภาพ */}
                    <div className="mt-2">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* รูปเดิม (ถ้าแก้ไข) */}
                        {editingDoctor?.image_url && (
                          <div>
                            <label className="mb-3 block text-sm font-medium text-gray-600">
                              รูปปัจจุบัน
                            </label>
                            <div className="overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50 p-3 py-5 hover:bg-gray-100">
                              {editingDoctor.image_url &&
                              editingDoctor.image_url !== "" &&
                              editingDoctor.image_url.includes(
                                "toothtoday-bucket/images/doctors",
                              ) ? (
                                <div className="relative h-48 w-full">
                                  <Image
                                    src={editingDoctor.image_url}
                                    alt={editingDoctor.name}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="relative h-48 w-full">
                                  <Image
                                    src={
                                      "/images/services-pic/no_image_available.jpg"
                                    }
                                    alt={editingDoctor.name}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* รูปใหม่ (preview) */}
                        <div>
                          <label className="mb-3 block text-sm font-medium text-gray-600">
                            {editingDoctor ? "รูปใหม่" : "รูปแพทย์"}
                          </label>
                          <div className="overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-50 p-3 py-5 hover:bg-gray-100">
                            {previewUrl ? (
                              <div className="relative h-48 w-full">
                                <Image
                                  src={previewUrl}
                                  alt="New doctor image"
                                  fill
                                  className="object-contain"
                                />
                                <button
                                  type="button"
                                  onClick={handleCancelNewImage}
                                  className="absolute -top-2 -right-2 rounded-full bg-red-500 p-2 text-white shadow-lg transition-colors hover:bg-red-600"
                                >
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <div className="relative h-48 w-full">
                                {/* Upload Button Inside Preview Area */}
                                <input
                                  id="image-upload"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileSelect}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="image-upload"
                                  className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center transition-colors hover:bg-gray-100"
                                >
                                  <svg
                                    className="mb-2 h-12 w-12 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                  </svg>
                                  <span className="mb-1 text-sm font-medium text-gray-600">
                                    Choose Image
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Click to upload
                                  </span>
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="border-t border-t-slate-300 bg-gray-50 p-4 md:p-6">
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={resetDoctorForm}
                  className="rounded border border-slate-300 bg-slate-200 px-4 py-2 hover:bg-slate-300"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  form="doctorForm"
                  className="rounded bg-blue-800 px-4 py-2 text-white hover:bg-blue-900"
                >
                  {editingDoctor ? "อัปเดต" : "เพิ่ม"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <div
          className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-slate-800/50 p-4"
          onClick={handleModalBackdropClick}
        >
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white">
            <div className="border-b border-b-slate-300 p-4 md:p-6">
              <h3 className="text-xl font-semibold">
                {editingSchedule ? "แก้ไขตารางเวลา" : "เพิ่มตารางเวลาใหม่"}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <form id="scheduleForm" onSubmit={handleScheduleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      แพทย์
                    </label>
                    <select
                      required
                      value={scheduleForm.doctor_id}
                      onChange={(e) =>
                        setScheduleForm({
                          ...scheduleForm,
                          doctor_id: e.target.value,
                        })
                      }
                      className="w-full rounded border border-slate-300 p-2"
                    >
                      <option value="">เลือกแพทย์</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      วัน
                    </label>
                    <select
                      required
                      value={scheduleForm.day_of_week}
                      onChange={(e) =>
                        setScheduleForm({
                          ...scheduleForm,
                          day_of_week: e.target.value,
                        })
                      }
                      className="w-full rounded border border-slate-300 p-2"
                    >
                      <option value="">เลือกวัน</option>
                      {dayNames.map((day, index) => (
                        <option key={index} value={index}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        เวลาเริ่ม (ชม)
                      </label>
                      <select
                        required
                        value={scheduleForm.start_time}
                        onChange={(e) =>
                          setScheduleForm({
                            ...scheduleForm,
                            start_time: e.target.value,
                          })
                        }
                        className="w-full overflow-y-auto rounded border border-slate-300 bg-white p-2"
                      >
                        <option value="">เลือกเวลา</option>
                        {Array.from({ length: 13 }).map((_, i) => {
                          const h = i + 8; // เริ่มที่ 8 เสมอ
                          const hourString = h.toString().padStart(2, "0");
                          return (
                            <option
                              key={hourString}
                              value={`${hourString}:00:00`}
                            >
                              {hourString}:00 น.
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        เวลาสิ้นสุด (ชม)
                      </label>
                      <select
                        required
                        value={scheduleForm.end_time}
                        onChange={(e) =>
                          setScheduleForm({
                            ...scheduleForm,
                            end_time: e.target.value,
                          })
                        }
                        className="w-full overflow-y-auto rounded border border-slate-300 bg-white p-2"
                      >
                        <option value="">เลือกเวลา</option>

                        {Array.from({ length: 13 }).map((_, i) => {
                          const h = i + 9; // เริ่มที่ 9 เสมอ
                          const hourString = h.toString().padStart(2, "0");
                          return (
                            <option
                              key={hourString}
                              value={`${hourString}:00:00`}
                            >
                              {hourString}:00 น.
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="border-t border-t-slate-300 bg-gray-50 p-4 md:p-6">
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={resetScheduleForm}
                  className="rounded border border-slate-300 bg-slate-200 px-4 py-2 hover:bg-slate-300"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  form="scheduleForm"
                  className="rounded bg-blue-800 px-4 py-2 text-white hover:bg-blue-900"
                >
                  {editingSchedule ? "อัปเดต" : "เพิ่ม"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
