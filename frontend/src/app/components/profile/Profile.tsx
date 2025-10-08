"use client";
import React, { useEffect, useState, FormEvent } from "react";
import api from "@/app/lib/api";
import { ProfileData, ProfileAppointment } from "@/app/types/user";
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faPenToSquare,
  faFloppyDisk,
  faUser,
  faHeartPulse,
  faCakeCandles,
  faTimes,
  faCalendar,
  faClock,
  faUserDoctor,
  faNoteSticky,
} from "@fortawesome/free-solid-svg-icons";
import { faLine } from "@fortawesome/free-brands-svg-icons";

import Swal from "sweetalert2";
import Image from "next/image";
type TokenPayload = {
  exp: number;
  role: string;
  user_id: number;
};

function Profile() {
  const [activeTab, setActiveTab] = useState("current");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [appointments, setAppointments] = useState<ProfileAppointment[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    chronic_disease: "",
    age: "",
  });

  const isTokenExpired = (token: string) => {
    if (!token) return true;
    const decoded: TokenPayload = jwtDecode(token);
    const now = Date.now() / 1000; // timestamp วินาที
    return decoded.exp < now;
  };

  useEffect(() => {
    const token = localStorage.getItem("token"); // ดึง token ใน useEffect -> safe
    // console.log(token);

    if (!token) {
      window.location.href = "/login";
      return;
    }
    if (token) {
      try {
        const decoded: TokenPayload = jwtDecode(token);
        if (decoded.role === "admin") {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
    if (isTokenExpired(token)) {
      Swal.fire({
        icon: "warning",
        title: "Session หมดอายุ",
        text: "กรุณา login ใหม่เพื่อเข้าใช้งาน",
        confirmButtonText: "ตกลง",
      }).then(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
      return;
    }
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setProfile(res.data.user);
        // console.log(res.data);
        setFormData({
          name: res.data.user.name || "",
          email: res.data.user.email || "",
          phone: res.data.user.phone || "",
          chronic_disease: res.data.user.chronic_disease || "",
          age: res.data.user.age != null ? String(res.data.user.age) : "",
        });
        setAppointments(res.data.appointments || []);
      } catch (error) {
        console.error("error :", error);
      }
    };
    fetchProfile();
  }, []);
  const handleChange = (e: FormEvent) => {
    const target = e.target as HTMLInputElement;
    // console.log(target);
    setFormData({ ...formData, [target.name]: target.value });
  };
  const handleCancel = async () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        chronic_disease: profile.chronic_disease || "",
        age: profile.age != null ? String(profile.age) : "",
      });
    }
    setEditing(false);
  };
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = {
        ...formData,
        age: formData.age ? Number(formData.age) : 0,
      };
      // console.log("payload", payload);
      const res = await api.put("/users/me", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setProfile(res.data);
      setEditing(false);
      Swal.fire({
        title: "บันทึกสำเร็จ!",
        text: "ข้อมูลของคุณได้รับการอัปเดตแล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#22c55e", // สีเขียว
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "บันทึกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
        icon: "error",
        confirmButtonText: "ปิด",
        confirmButtonColor: "#ef4444", // สีแดง
      });
    }
  };
  return (
    <div className="mt-20 min-h-screen bg-blue-50 flex items-center justify-center  flex-col py-10">
      <h2 className="text-4xl font-bold text-blue-900 text-center mt-5  mb-5">
        Profile
      </h2>
      <section className="bg-white p-8 rounded-2xl shadow-md w-full max-w-xl space-y-3 h-[80vh] overflow-y-auto">
        {editing ? (
          <div className=" ">
            <div className="grid grid-cols-1 md:grid-cols-2 space-y-3 text-left ">
              <div className="flex justify-center items-center">
                <FontAwesomeIcon icon={faUser} className="text-blue-900 pe-4" />
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border border-gray-400 p-1 pl-2 rounded-lg w-50"
                  placeholder="Name"
                />
              </div>
              <div className="flex justify-center items-center">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-blue-900 pe-4"
                />
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border border-gray-400  p-1 pl-2 rounded-lg w-50"
                  placeholder="Email"
                />
              </div>
              <div className="flex justify-center items-center">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="text-blue-900 pe-4"
                />

                <input
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    // ลบทุกตัวที่ไม่ใช่เลข
                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, phone: onlyNumbers });
                  }}
                  className="border border-gray-400 p-1 pl-2 rounded-lg w-50"
                  placeholder="Phone"
                />
              </div>
              <div className="flex justify-center items-center">
                <FontAwesomeIcon
                  icon={faCakeCandles}
                  className="text-blue-900 pe-4"
                />
                <input
                  name="age"
                  value={formData.age ?? ""}
                  type="number"
                  onChange={handleChange}
                  className="border border-gray-400 p-1 pl-2 rounded-lg w-50 "
                  placeholder="Age"
                />
              </div>
              <div className="flex justify-center items-center">
                <FontAwesomeIcon
                  icon={faHeartPulse}
                  className="text-blue-900 pe-4"
                />
                <input
                  name="chronic_disease"
                  value={formData.chronic_disease}
                  onChange={handleChange}
                  className="border border-gray-400 p-1 pl-2 rounded-lg w-50"
                  placeholder="โรคประจำตัว"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className=" text-center">
            <p className="text-gray-900 text-3xl text-bold mb-3">
              {profile?.name}
            </p>
            <div className="grid grid-cols-2 space-y-3 text-left">
              <p className="text-gray-700 text-lg">
                <FontAwesomeIcon icon={faEnvelope} className="text-blue-900" />{" "}
                {profile?.email}
              </p>
              <p className="text-gray-700 text-lg">
                <FontAwesomeIcon icon={faPhone} className="text-blue-900" />{" "}
                {profile?.phone}
              </p>
              <p className="text-gray-700 text-lg">
                <FontAwesomeIcon
                  icon={faCakeCandles}
                  className="text-blue-900"
                />{" "}
                {profile?.age != 0 ? (
                  <>{profile?.age} ปี</>
                ) : (
                  "ยังไม่ได้กรอกอายุ"
                )}
              </p>
              <p className="text-gray-700 text-lg">
                <FontAwesomeIcon
                  icon={faHeartPulse}
                  className="text-blue-900"
                />{" "}
                {profile?.chronic_disease &&
                profile.chronic_disease.trim() != ""
                  ? profile.chronic_disease
                  : "ยังไม่ได้กรอกโรคประจำตัว"}
              </p>

              <p className="text-gray-700 text-lg">
                <FontAwesomeIcon icon={faLine} className="text-blue-900" /> :
                ยังไม่ได้เชื่อมไลน์
              </p>

              {isAdmin && (
                <p className="text-red-500  text-lg">
                  {profile?.role ? (
                    <>
                      <span className="text-black">Status: </span>
                      {profile.role}
                    </>
                  ) : (
                    ""
                  )}
                </p>
              )}
            </div>
          </div>
        )}
        <div className="flex justify-center items-center gap-4">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className=" px-4 py-3 rounded bg-green-300 text-green-800 hover:bg-green-400 shadow-sm"
              >
                <FontAwesomeIcon icon={faFloppyDisk} /> Save
              </button>
              <button
                onClick={handleCancel}
                className=" px-4 py-3 rounded bg-red-400 text-white hover:bg-red-600 shadow-sm"
              >
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 shadow-sm px-4 py-1 sm:py-2 rounded "
              >
                <FontAwesomeIcon icon={faPenToSquare} /> Edit
              </button>
              <button
                className="bg-green-500 text-white px-4 py-1 sm:py-2 rounded"
                disabled
              >
                เชื่อมไลน์ (soon)
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-1 sm:py-2 rounded"
                disabled
              >
                นัดหมายใหม่ (soon)
              </button>
            </>
          )}
        </div>

        {/* ประวัติการนัดปัจจุบัน */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-2xl text-bold text-blue-900 ps-3">
            ประวัติการนัด
          </div>
          <div className="flex flex-col sm:flex-row">
            <button
              onClick={() => setActiveTab("current")}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === "current"
                  ? "bg-blue-100 text-blue-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              การนัดปัจจุบัน (
              {appointments.filter((a) => a.is_past === "current").length})
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === "past"
                  ? "bg-blue-100 text-blue-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              ประวัติที่ผ่านมา (
              {appointments.filter((a) => a.is_past === "past").length})
            </button>
          </div>
        </div>
        <div className="">
          {/* <h3 className="font-bold mt-4 mb-3">ประวัติการนัดปัจจุบัน</h3> */}
          {activeTab === "current" ? (
            <>
              {appointments.filter((a) => a.is_past === "current").length >
              0 ? (
                <>
                  {appointments
                    .filter((a) => a.is_past === "current")
                    .map((a) => (
                      <div
                        key={a.id}
                        className="border border-gray-300 rounded-2xl p-3 mb-2 bg-gray-100 text-gray-600"
                      >
                        <div className="flex justify-between">
                          <div className="flex gap-3">
                            {a.image_url ? (
                              <span className="flex justify-center items-center">
                                <Image
                                  src={a.image_url ? a.image_url : ""}
                                  alt=""
                                  width={170}
                                  height={170}
                                  priority
                                  className="rounded-xl mt-2"
                                />
                              </span>
                            ) : (
                              ""
                            )}
                            <div className="space-y-0.5">
                              <div className="mb-2">
                                <p className="text-bold text-md  inline-block rounded-full bg-blue-100 text-blue-800  px-2 py-1">
                                  {a.service_name}
                                </p>
                              </div>
                              <div className="flex justify-center items-center">
                                <FontAwesomeIcon
                                  icon={faUserDoctor}
                                  className="text-blue-900 pe-1"
                                />
                                <p>{a.doctor_name}</p>
                              </div>
                              <div className="flex justify-start items-center">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="text-blue-900 pe-1"
                                />
                                <p>{a.date}</p>
                              </div>
                              <div className="flex justify-start items-center">
                                <FontAwesomeIcon
                                  icon={faClock}
                                  className="text-blue-900 pe-1"
                                />
                                <p>{a.time_range}</p>
                              </div>
                              <div className="flex justify-start items-center">
                                {a.note ? (
                                  <>
                                    <FontAwesomeIcon
                                      icon={faNoteSticky}
                                      className="text-blue-900 pe-1"
                                    />
                                    <p>a.note</p>
                                  </>
                                ) : (
                                  ""
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="">
                            <p
                              className={`inline-block font-bold text-md px-3 py-1 rounded-full
                                ${
                                  a.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : a.status === "confirm"
                                    ? "bg-blue-100 text-blue-800"
                                    : a.status === "no_show"
                                    ? "bg-red-100 text-red-800"
                                    : a.status === "in_progress"
                                    ? "bg-purple-100 text-purple-800"
                                    : a.status === "complete"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                            >
                              {a.status === "pending"
                                ? "รอยืนยัน"
                                : a.status === "confirm"
                                ? "ยืนยันแล้ว"
                                : a.status === "no_show"
                                ? "ไม่ได้เข้าร่วม"
                                : a.status === "in_progress"
                                ? "กำลังดำเนินการ"
                                : a.status === "complete"
                                ? "เสร็จสิ้น"
                                : ""}
                            </p>
                          </div>
                        </div>
                        {a.status === "pending" ? (
                          <p className="text-center mt-1">
                            <span className="text-red-500">*</span>{" "}
                            กรุณาเช็คอินที่คลินิกภายใน 10 นาทีหลังเริ่มบริการ
                          </p>
                        ) : a.status === "confirm" ? (
                          <p className="text-center mt-1">เช็คอินแล้ว</p>
                        ) : (
                          ""
                        )}
                      </div>
                    ))}
                </>
              ) : (
                <p className="text-center pt-5">
                  ยังไม่มีประวัติการนัดหมายปัจจุบัน
                </p>
              )}
            </>
          ) : (
            <>
              {appointments.filter((a) => a.is_past === "past").length > 0 ? (
                <>
                  {appointments
                    .filter((a) => a.is_past === "past")
                    .map((a) => (
                      <div
                        key={a.id}
                        className="border border-gray-300 rounded-2xl p-3 mb-2 bg-gray-100 text-gray-600"
                      >
                        <div className="flex justify-between">
                          <div className="flex gap-3">
                            {a.image_url ? (
                              <span className="flex justify-center items-center">
                                <Image
                                  src={a.image_url ? a.image_url : ""}
                                  alt=""
                                  width={150}
                                  height={150}
                                  priority
                                  className="rounded-xl mt-2"
                                />
                              </span>
                            ) : (
                              ""
                            )}
                            <div className="space-y-0.5">
                              <div className="mb-2">
                                <p className="text-bold text-md  inline-block rounded-full bg-blue-100 text-blue-800  px-2 py-1">
                                  {a.service_name}
                                </p>
                              </div>
                              <div className="flex justify-center items-center">
                                <FontAwesomeIcon
                                  icon={faUserDoctor}
                                  className="text-blue-900 pe-1"
                                />
                                <p>{a.doctor_name}</p>
                              </div>
                              <div className="flex justify-start items-center">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="text-blue-900 pe-1"
                                />
                                <p>{a.date}</p>
                              </div>
                              <div className="flex justify-start items-center">
                                <FontAwesomeIcon
                                  icon={faClock}
                                  className="text-blue-900 pe-1"
                                />
                                <p>{a.time_range}</p>
                              </div>
                              <div className="flex justify-start items-center">
                                {a.note ? (
                                  <>
                                    <FontAwesomeIcon
                                      icon={faNoteSticky}
                                      className="text-blue-900 pe-1"
                                    />
                                    <p>a.note</p>
                                  </>
                                ) : (
                                  ""
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="">
                            <p
                              className={`inline-block font-bold text-md px-3 py-1 rounded-full
                                ${
                                  a.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : a.status === "confirm"
                                    ? "bg-blue-100 text-blue-800"
                                    : a.status === "no_show"
                                    ? "bg-red-100 text-red-800"
                                    : a.status === "in_progress"
                                    ? "bg-purple-100 text-purple-800"
                                    : a.status === "complete"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                            >
                              {a.status === "pending"
                                ? "รอยืนยัน"
                                : a.status === "confirm"
                                ? "ยืนยันแล้ว"
                                : a.status === "no_show"
                                ? "ไม่ได้เข้าร่วม"
                                : a.status === "in_progress"
                                ? "กำลังดำเนินการ"
                                : a.status === "complete"
                                ? "เสร็จสิ้น"
                                : ""}
                            </p>
                          </div>
                        </div>
                        {a.status === "no_show" ? (
                          <p className="text-center mt-1">
                            ไม่ได้เช็คอินที่คลินิกภายใน 10 นาทีหลังเริ่มบริการ
                          </p>
                        ) : a.status === "complete" ? (
                          <p className="text-center mt-1">เสร็จสิ้นการรับบริการ</p>
                        ) : (
                          ""
                        )}
                      </div>
                    ))}
                </>
              ) : (
                <p className="text-center pt-5">
                  ยังไม่มีประวัติการนัดหมายที่ผ่านมา
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Profile;
