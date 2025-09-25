"use client";
import api from "@/app/lib/api";
import React, { useState, useEffect, FormEvent } from "react";
import Calendar from "./Calendar";
import { Doctor, Slot, MonthAvailability, Service } from "@/app/types/booking";
import { Span } from "next/dist/trace";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import axios from "axios";

type TokenPayload = {
  exp: number;
  role: string;
  user_id: number;
};

function BookingForm() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    setToken(t);
    setIsLoggedIn(!!t);
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [doctorsRes, servicesRes] = await Promise.all([
          api.get<Doctor[]>("/doctors"),
          api.get<Service[]>("/services"),
        ]);

        setDoctors(doctorsRes.data);
        // console.log(doctorsRes.data);
        setServices(servicesRes.data);
        // console.log(servicesRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // fetch ปฏิทิน
  const fetchAvailability = async (year: number, month: number) => {
    const monthStr = `${year}-${month.toString().padStart(2, "0")}`;
    const res = await api.get<MonthAvailability>(
      `/appointment/availability?month=${monthStr}`
    );
    return res.data;
  };
  // fetch slots สำหรับ service ทันทีที่เลือก service (ยังไม่เลือกวัน)
  useEffect(() => {
    if (!selectedService) {
      return setSelectedDate("");
    }
    setSelectedDate("");
    const fetchSlotsByService = async () => {
      try {
        const res = await api.get<Slot[]>(
          `/appointment/slots?serviceId=${selectedService.id}` // date optional
        );
        setAvailableSlots(res.data);
        // console.log(res.data);
        setSelectedSlot(null);
        setSelectedDoctor(null);
        setAvailableDoctors([]);
      } catch (error) {
        console.error(error);
      }
    };

    fetchSlotsByService();
  }, [selectedService]);
  // เลือก service > เลือกวันที่
  useEffect(() => {
    if (!selectedDate || !selectedService) return;
    const fetchAvailableSlots = async () => {
      try {
        const res = await api.get<Slot[]>(
          `/appointment/slots?serviceId=${selectedService?.id}&date=${selectedDate}`
        );
        setAvailableSlots(res.data);
        // console.log(res.data);
        setSelectedSlot(null);
        setSelectedDoctor(null);
        setAvailableDoctors([]);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAvailableSlots();
  }, [selectedService, selectedDate]);

  /// เลือกเวลา > ทำการ  filter doctor  ที่ว่าง
  useEffect(() => {
    if (!selectedSlot) {
      setAvailableDoctors([]);
      return;
    }
    // console.log("selectedSlot", selectedSlot.time);
    // console.log("availableSlots", availableSlots);
    const doctorsWithSlot = availableSlots
      .filter((slot) => slot.time === selectedSlot.time)
      .flatMap((slot) => slot.doctors || []);
    // console.log("doctorsWithSlot", doctorsWithSlot);

    setAvailableDoctors(doctorsWithSlot as Doctor[]);
    // console.log("availableDoctors", availableDoctors);
    setSelectedDoctor(null);
  }, [selectedSlot, availableSlots]);

  useEffect(() => {
    setBookedSlots([]);
    if (!selectedDoctor) return;
    const fetchBookedSlots = async () => {
      try {
        const res = await api.get<string[]>(
          `/appointment/booked?doctorId=${selectedDoctor.id}&date=${selectedDate}`
        );
        setBookedSlots(res.data);
        // console.log(res.data)
      } catch (error) {
        console.error(error);
      }
    };
    fetchBookedSlots();
  }, [selectedDate, selectedDoctor]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !selectedDoctor || !selectedService)
      return alert("กรอกข้อมูลไม่ครบ");
    if (!token) return alert("กรุณาเข้าสู่ระบบก่อน");
    const decoded = jwtDecode<TokenPayload>(token);
    const formData = new FormData();
    formData.append("user_id", decoded.user_id.toString()); // ใส่จาก token หรือ decoded
    formData.append("doctor_id", selectedDoctor.id.toString());
    formData.append("service_id", selectedService.id.toString());
    formData.append(
      "appointment_time",
      `${selectedDate}T${selectedSlot.time}:00+07:00`
    );
    formData.append("status", "pending");
    formData.append("note", notes || "");
    if (file) formData.append("file", file);
    try {
      // console.log("de", decoded);
      // }
      // console.log(selectedDoctor,selectedService,formatDateTimeForPG(datetime),notes||null,image_url)

      // console.log({
      //   user_id: decoded.user_id,
      //   doctor_id: selectedDoctor?.id,
      //   service_id: selectedService?.id,
      //   appointment_time: `${selectedDate}T${selectedSlot.time}:00+07:00`,
      //   status: "pending",
      //   note: notes ? notes : "",
      //   image_url: image_url,
      // });
      // const image_url = file ? URL.createObjectURL(file) : "";

      // const res = await api.post("/appointment/book", {
      //   user_id: decoded.user_id,
      //   doctor_id: selectedDoctor?.id,
      //   service_id: selectedService?.id,
      //   appointment_time: `${selectedDate}T${selectedSlot.time}:00+07:00`,
      //   status: "pending",
      //   note: notes ? notes : "",
      //   image_url: image_url,
      // });
      const res = await api.post("/appointment/book", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // alert("จองคิวเรียบร้อย");
      setSelectedDoctor(null);
      setSelectedService(null);
      setSelectedDate("");
      setSelectedSlot(null);
      setAvailableDoctors([]);
      setAvailableSlots([]);
      setNotes("");
      setFile(null);
      const data = res.data;

      Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        html: `
    <p>คุณได้จองกับ: <strong>${data.doctor.name}</strong></p>
    <p>บริการ: <strong>${data.service.name}</strong></p>
    <p>วันที่: <strong>${data.date}</strong></p>
    <p>เวลา: <strong>${data.time_range}</strong></p>
    ${
      data.image_url
        ? `
        <div class="flex justify-center items-center mt-2">
        <img src="${data.image_url}" style="max-width:200px; margin-top:10px;" />
        </div>
        `
        : ""
    }
  `,
        confirmButtonText: "ตกลง",
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // error จาก backend
        const message =
          (err.response?.data as { error?: string })?.error ||
          "เกิดข้อผิดพลาดจาก server";
        Swal.fire({
          icon: "error",
          title: "ล้มเหลว",
          text: message,
        });
      } else if (err instanceof Error) {
        // error ของ frontend
        Swal.fire({
          icon: "error",
          title: "ล้มเหลว",
          text: err.message,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "ล้มเหลว",
          text: "เกิดข้อผิดพลาดไม่ทราบชนิด",
        });
      }
    }
  };

  const formatPrice = (price_min: number, price_max: number) => {
    return price_min === price_max
      ? `${price_min.toLocaleString()} ฿`
      : `${price_min.toLocaleString()} - ${price_max.toLocaleString()}฿`;
  };
  const formatDuration = (duration_minutes: number) => {
    if (duration_minutes < 60) return `${duration_minutes} นาที`;
    const hrs = Math.floor(duration_minutes / 60);
    const mins = duration_minutes % 60;
    return mins === 0 ? `${hrs} ชั่วโมง` : `${hrs} ชั่วโมง ${mins} นาที`;
  };
  const canBook =
    selectedDate &&
    selectedSlot &&
    selectedDoctor &&
    !bookedSlots?.includes(selectedSlot.time);
  if (loading) return <p className="text-center mt-10">Loading ...</p>;
  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col items-center  ">
        {/* <div className="xl:w-full bg-white pt-6 rounded-t-lg shadow">
            <h1 className="text-blue-900 text-4xl font-semibold text-center">
              จองคิวคลินิกฟัน
            </h1>
        </div> */}

        <div className="grid xl:grid-cols-2 xl:gap-5 xl:w-3/4 items-center border border-gray-300 bg-white p-6 rounded-lg shadow space-y-4">
          <div className="xl:w-full ">
            <label>เลือกบริการ</label>
            <select
              className="mt-1 p-2 w-full  border border-gray-300  rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={selectedService?.id ?? ""}
              onChange={(e) => {
                const service =
                  services.find((s) => s.id === Number(e.target.value)) || null;
                setSelectedService(service);
                setSelectedDate("");
                setSelectedSlot(null);
                setSelectedDoctor(null);
                setAvailableSlots([]);
                setAvailableDoctors([]);
              }}
            >
              <option value="">-- เลือกบริการ --</option>
              {services.map((s) => (
                <option value={s.id} key={s.id} className="">
                  {s.name} ราคา {formatPrice(s.price_min, s.price_max)}
                  {/* ระยะเวลา{" "} */} ({formatDuration(s.duration_minutes)})
                </option>
              ))}
            </select>
            {!selectedService ? (
              <h3 className="text-lg font-normal text-center mt-3">
                {" "}
                (กรุณาเลือกบริการก่อน)
              </h3>
            ) : (
              ""
            )}
            <h2 className="text-2xl font-bold mb-3 text-center text-blue-900">
              {/* ปฏิทินจองคิว */}
            </h2>
            <Calendar
              selectedService={selectedService}
              onSelectDate={setSelectedDate}
              fetchAvailability={async (y, m) =>
                api
                  .get(`/appointment/availability?month=${y}-${m}`)
                  .then((res) => res.data)
              }
            />
          </div>

          <div
            // onSubmit={handleSubmit}
            // className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow space-y-4"
            className="xl:w-full space-y-4 flex flex-col xl:p-5  "
          >
            <div className="">
              <label className="">เลือกเวลา</label>
              <select
                className="mt-1 p-2 w-full  border border-gray-300  rounded-2xl focus:ring-2 focus:ring-blue-300"
                value={selectedSlot?.time ?? ""}
                onChange={(e) => {
                  const slot =
                    availableSlots.find((s) => s.time === e.target.value) ||
                    null;
                  setSelectedSlot(slot);
                  setSelectedDoctor(null);
                }}
                disabled={!selectedDate}
              >
                <option value="" disabled>
                  {selectedDate ? "-- เลือกเวลา --" : "กรุณาเลือกวัน"}
                </option>
                {availableSlots.map((slot, index) => (
                  <option
                    value={slot.time}
                    key={`${slot.time}-${index}`}
                    disabled={slot.status === "booked"}
                  >
                    {slot.time}{" "}
                    {/* {slot.status === "booked" ? "(เต็ม)" : ""} */}
                    {slot.doctors?.[0].Status === "passed"
                      ? "(passed)"
                      : slot.status === "booked"
                      ? "(เต็ม)"
                      : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="">
              <label>เลือกแพทย์</label>
              <select
                className="mt-1 p-2 w-full  border border-gray-300  rounded-2xl focus:ring-2 focus:ring-blue-300"
                value={selectedDoctor?.id ?? ""}
                // onChange={(e) => setSelectedDoctor(doctors.find((d) => d.id === Number(e.target.value)) || null)}
                // onChange={(e) => {
                //   const doc =
                //     availableDoctors.find(
                //       (d) => d.id === Number(e.target.value)
                //     ) || null;
                //   setSelectedDoctor(doc);
                // }}
                onChange={
                  (e) => {
                    const doctorId = Number(e.target.value);
                    const doctor =
                      availableDoctors.find((d) => d.id === doctorId) || null;
                    setSelectedDoctor(doctor);
                  }
                  // setSelectedDoctor(
                  //   availableDoctors.find(
                  //     (d) => d.id === Number(e.target.value)
                  //   ) || null
                  // )
                }
                disabled={!selectedSlot || availableDoctors.length === 0}
              >
                <option value="" disabled>
                  {selectedSlot ? "-- เลือกแพทย์ --" : "กรุณาเลือกเวลา"}
                </option>
                {availableDoctors.map((d, idx) => (
                  <option
                    key={`${d.id}-${idx}`}
                    value={d.id}
                    disabled={d.Status !== "available"}
                  >
                    {d.name} ({d.specialization}){" "}
                    {d.Status !== "available" ? "(ไม่ว่าง)" : ""}
                  </option>
                ))}
                {/* {doctors.map((d) => (
                  <option value={d.id} key={d.id}>
                    {d.name} ({d.specialization})
                  </option>
                ))} */}
              </select>
            </div>

            <div className="">
              <label>แนบรูปฟัน (ถ้ามี)</label>
              <input
                type="file"
                className="bmt-1 p-2 w-full  border border-gray-300  rounded-2xl focus:ring-2 focus:ring-blue-300"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="">
              <label>หมายเหตุ</label>
              <textarea
                className="mt-1 p-2 w-full  border border-gray-300  rounded-2xl focus:ring-2 focus:ring-blue-300"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <button
              disabled={!canBook || !isLoggedIn}
              type="submit"
              className={`  px-6 py-2 rounded-2xl text-xl w-full
                            ${
                              canBook && isLoggedIn
                                ? "bg-blue-900 text-white hover:bg-blue-950"
                                : "bg-gray-300 text-gray-500"
                            }
                            `}
              onClick={handleSubmit}
            >
              {!isLoggedIn
                ? "โปรดล็อคอิน"
                : !canBook
                ? "โปรดทำรายการให้ครบ"
                : "จองคิว"}
            </button>
          </div>
        </div>
        {/* <div className="lg:w-1/3 bg-white p-6 rounded-lg shadow space-y-4"> */}

        {/* </div> */}
      </form>
    </>
  );
}

export default BookingForm;
