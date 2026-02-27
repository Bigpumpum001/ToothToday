"use client";
import React, { useEffect, useState, FormEvent } from "react";
import api from "@/lib/api";
import { ProfileData, ProfileAppointment } from "@/types/user";
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
  faTrash,
  faArrowLeft,
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
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("current");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
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
    const token = localStorage.getItem("token");
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

    fetchProfile(token);
  }, []);

  const fetchProfile = async (token: string) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false); // โหลดเสร็จ
    }
  };
  const ChangeEditing = (e: FormEvent) => {
    const target = e.target as HTMLInputElement;
    // console.log(target);
    setFormData({ ...formData, [target.name]: target.value });
  };

  const Cancel = async () => {
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

  const SaveEditing = async () => {
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
      await fetchProfile(token);
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

  const DeleteAppointment = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await api.delete(
        `/appointment/${id}/delete`,
        //{}, ถ้า post ต้องใส่
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (res.status >= 200 && res.status < 300) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
        Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          text: "ยกเลิกคิวเรียบร้อย",
          confirmButtonText: "ตกลง",
        }).then(() => {
          window.location.reload();
        });
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ลบคิวไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
        confirmButtonText: "ตกลง",
      });
    }
  };
  const connectLine = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "กรุณา login ก่อนเชื่อม LINE",
        icon: "warning",
        confirmButtonText: "ปิด",
        confirmButtonColor: "#ef4444", // สีแดง
      });
      return;
    }
    const decoded: TokenPayload = jwtDecode(token);
    const state = btoa(JSON.stringify({ user_id: decoded.user_id }));
    const clientId = process.env.NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID;
    const redirectUri = process.env.NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI || "";
    const encodedRedirectUri = encodeURIComponent(redirectUri);
    window.location.href = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodedRedirectUri}&state=${state}&scope=profile%20openid`;
  };
  const unLinkLine = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "กรุณา login ก่อนยกเลิกการเชื่อม LINE",
        icon: "warning",
        confirmButtonText: "ปิด",
        confirmButtonColor: "#ef4444",
      });
      return;
    }
    try {
      const res = await api.delete("/line/unlink", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status >= 200 && res.status < 300) {
        Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          text: "ยกเลิกการเชื่อมต่อ LINE เรียบร้อยแล้ว",
          confirmButtonText: "ตกลง",
        }).then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "ล้มเหลว",
          text: "ไม่สามารถยกเลิกการเชื่อมต่อ LINE ได้",
          confirmButtonText: "ตกลง",
        });
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "เกิดปัญหาบางอย่าง กรุณาลองใหม่อีกครั้ง",
        confirmButtonText: "ตกลง",
      });
    }
  };
  if (isLoading) {
    return (
      <div className="mt-20 flex min-h-screen flex-col items-center bg-blue-50 py-10">
        <p className="mt-3 text-lg text-gray-500">isLoading...</p>
      </div>
    );
  }
  return (
    <div className="mt-5 flex min-h-screen flex-col items-center justify-center bg-blue-50 py-10 xl:mt-20">
      {/* <h2 className="text-4xl font-bold text-blue-900 text-center mt-5  mb-5">
        Profile
      </h2> */}
      <section className="mt-3 h-[85vh] w-full max-w-7xl space-y-3 overflow-y-auto rounded-2xl bg-white p-8 shadow-md">
        <div className="flex items-center justify-center">
          <Image
            src={profile?.line_picture_url ?? "/images/profile/unknown.png"}
            alt=""
            width={170}
            height={170}
            priority
            className="mt-2 rounded-full"
          />
        </div>
        {editing ? (
          <div className="flex justify-center">
            <div className="grid grid-cols-1 space-y-3 text-left md:mt-3 md:grid-cols-2 md:gap-3">
              <div className="flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="pe-4 text-blue-900" />
                <input
                  name="name"
                  value={formData.name}
                  onChange={ChangeEditing}
                  className="w-50 rounded-lg border border-gray-400 p-1 pl-2"
                  placeholder="Name"
                />
              </div>
              <div className="flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="pe-4 text-blue-900"
                />
                <input
                  name="email"
                  value={formData.email}
                  onChange={ChangeEditing}
                  className="w-50 rounded-lg border border-gray-400 p-1 pl-2"
                  placeholder="Email"
                />
              </div>
              <div className="flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="pe-4 text-blue-900"
                />
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    // ลบทุกตัวที่ไม่ใช่เลข
                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, phone: onlyNumbers });
                  }}
                  className="w-50 rounded-lg border border-gray-400 p-1 pl-2"
                  placeholder="Phone"
                />
              </div>
              <div className="flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faCakeCandles}
                  className="pe-4 text-blue-900"
                />
                <input
                  name="age"
                  value={formData.age ?? ""}
                  type="number"
                  onChange={ChangeEditing}
                  className="w-50 rounded-lg border border-gray-400 p-1 pl-2"
                  placeholder="Age"
                />
              </div>
              <div className="flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faHeartPulse}
                  className="pe-4 text-blue-900"
                />
                <input
                  name="chronic_disease"
                  value={formData.chronic_disease}
                  onChange={ChangeEditing}
                  className="w-50 rounded-lg border border-gray-400 p-1 pl-2"
                  placeholder="โรคประจำตัว"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-bold mb-3 text-3xl text-gray-900">
              {profile?.name}
            </p>
            <div className="flex justify-center">
              <div className="grid grid-cols-2 space-y-3 text-left md:gap-x-5">
                <p className="text-lg text-gray-700">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="text-blue-900"
                  />{" "}
                  {profile?.email}
                </p>
                <p className="text-lg text-gray-700">
                  <FontAwesomeIcon icon={faPhone} className="text-blue-900" />{" "}
                  {profile?.phone}
                </p>
                <p className="text-lg text-gray-700">
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
                <p className="text-lg text-gray-700">
                  <FontAwesomeIcon
                    icon={faHeartPulse}
                    className="text-blue-900"
                  />{" "}
                  {profile?.chronic_disease &&
                  profile.chronic_disease.trim() != ""
                    ? profile.chronic_disease
                    : "ยังไม่ได้กรอกโรคประจำตัว"}
                </p>

                <p className="text-lg text-gray-700">
                  <FontAwesomeIcon icon={faLine} className="text-blue-900" /> :
                  {profile?.line_user_id ? (
                    <>
                      {" "}
                      <span className="font-bold">
                        {profile.line_display_name}
                      </span>
                    </>
                  ) : (
                    <>ยังไม่ได้เชื่อมบัญชี LINE</>
                  )}
                </p>

                {isAdmin && (
                  <p className="text-lg text-red-500">
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
          </div>
        )}
        {profile?.line_user_id ? (
          <>{""}</>
        ) : (
          <div className="text-center text-gray-600">
            โปรดเชื่อมไลน์เพื่อรับการแจ้งเตือน
          </div>
        )}
        <div className="flex items-center justify-center gap-4">
          {editing ? (
            <>
              <button
                onClick={SaveEditing}
                className="mt-2 rounded bg-green-300 px-4 py-1 text-gray-900 shadow-sm hover:bg-green-400 sm:py-2"
              >
                <FontAwesomeIcon icon={faFloppyDisk} /> Save
              </button>
              <button
                onClick={Cancel}
                className="mt-2 rounded bg-red-400 px-4 py-1 text-white shadow-sm hover:bg-red-600 sm:py-2"
              >
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditing(true);
                  setShowDelete(false);
                }}
                className="rounded bg-amber-400 px-4 py-1 text-gray-900 shadow-sm hover:bg-amber-500 sm:py-2"
              >
                <FontAwesomeIcon icon={faPenToSquare} /> Edit
              </button>

              {profile?.line_user_id ? (
                <button
                  onClick={unLinkLine}
                  className="rounded bg-red-400 px-4 py-1 text-white hover:bg-red-500 sm:py-2"
                >
                  <FontAwesomeIcon icon={faLine} className="me-1 text-2xl" />{" "}
                  ยกเลิกการเชื่อม LINE
                </button>
              ) : (
                <button
                  onClick={connectLine}
                  className="flex items-center rounded bg-green-500 px-4 py-1 text-white hover:bg-green-600 sm:py-2"
                  // disabled
                >
                  <FontAwesomeIcon icon={faLine} className="me-1 text-2xl" />{" "}
                  เชื่อม LINE
                </button>
              )}

              {showDelete ? (
                <button
                  className="rounded bg-blue-800 px-4 py-1 text-white hover:bg-blue-900 sm:py-2"
                  onClick={() => setShowDelete(false)}
                >
                  <FontAwesomeIcon icon={faArrowLeft} /> ย้อนกลับ
                </button>
              ) : (
                <button
                  className="rounded bg-gray-500 px-4 py-1 text-white hover:bg-gray-600 sm:py-2"
                  onClick={() => {
                    setShowDelete(true);
                    setEditing(false);
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} /> ยกเลิกคิว
                </button>
              )}
            </>
          )}
        </div>

        {/* ประวัติการนัดปัจจุบัน */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-bold ps-3 text-2xl text-blue-900">
            ประวัติการนัด
          </div>
          <div className="flex flex-col sm:flex-row">
            <button
              onClick={() => setActiveTab("current")}
              className={`rounded-lg px-6 py-2 font-medium transition-all ${
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
              className={`rounded-lg px-6 py-2 font-medium transition-all ${
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
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2">
                  {appointments
                    .filter((a) => a.is_past === "current")
                    .map((a) => (
                      <div
                        key={a.id}
                        className="mb-2 rounded-2xl border border-gray-300 bg-gray-100 p-3 text-gray-600"
                      >
                        <div className="flex justify-between">
                          <div className="flex gap-3">
                            {a.image_url ? (
                              <span className="flex items-center justify-center">
                                <Image
                                  src={a.image_url ? a.image_url : ""}
                                  alt=""
                                  width={170}
                                  height={170}
                                  priority
                                  className="mt-2 rounded-xl"
                                />
                              </span>
                            ) : (
                              ""
                            )}
                            <div className="space-y-0.5">
                              <div className="mb-2">
                                <p className="text-bold text-md inline-block rounded-full bg-blue-100 px-2 py-1 text-blue-800">
                                  {a.service_name}
                                </p>
                              </div>
                              <div className="flex items-center justify-start">
                                <FontAwesomeIcon
                                  icon={faUserDoctor}
                                  className="pe-1 text-blue-900"
                                />
                                <p>{a.doctor_name}</p>
                              </div>
                              <div className="flex items-center justify-start">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="pe-1 text-blue-900"
                                />
                                <p>{a.date}</p>
                              </div>
                              <div className="flex items-center justify-start">
                                <FontAwesomeIcon
                                  icon={faClock}
                                  className="pe-1 text-blue-900"
                                />
                                <p>{a.time_range}</p>
                              </div>
                              <div className="flex items-center justify-start">
                                {a.note ? (
                                  <>
                                    <FontAwesomeIcon
                                      icon={faNoteSticky}
                                      className="pe-1 text-blue-900"
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
                              className={`text-md inline-block rounded-full px-3 py-1 font-bold ${
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
                                ? "รอดำเนินการ"
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
                          <>
                            <p className="mt-1 text-center">
                              <span className="text-red-500">*</span>{" "}
                              กรุณาเช็คอินที่คลินิกภายใน 10 นาทีหลังเริ่มบริการ
                            </p>
                            {showDelete ? (
                              <div className="flex items-center justify-end">
                                <button
                                  onClick={() => DeleteAppointment(a.id)}
                                  className="mt-1 flex items-center gap-1 text-red-600 hover:text-red-800"
                                >
                                  <FontAwesomeIcon icon={faTrash} /> ยกเลิกคิว
                                </button>
                              </div>
                            ) : (
                              ""
                            )}
                          </>
                        ) : a.status === "confirm" ? (
                          <p className="mt-1 text-center">เช็คอินแล้ว</p>
                        ) : (
                          ""
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="pt-5 text-center">
                  ยังไม่มีประวัติการนัดหมายปัจจุบัน
                </p>
              )}
            </>
          ) : (
            <>
              {appointments.filter((a) => a.is_past === "past").length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-2">
                  {appointments
                    .filter((a) => a.is_past === "past")
                    .map((a) => (
                      <div
                        key={a.id}
                        className="mb-2 rounded-2xl border border-gray-300 bg-gray-100 p-3 text-gray-600"
                      >
                        <div className="flex justify-between">
                          <div className="flex gap-3">
                            {a.image_url ? (
                              <span className="flex items-center justify-center">
                                <Image
                                  src={a.image_url ? a.image_url : ""}
                                  alt=""
                                  width={150}
                                  height={150}
                                  priority
                                  className="mt-2 rounded-xl"
                                />
                              </span>
                            ) : (
                              ""
                            )}
                            <div className="space-y-0.5">
                              <div className="mb-2">
                                <p className="text-bold text-md inline-block rounded-full bg-blue-100 px-2 py-1 text-blue-800">
                                  {a.service_name}
                                </p>
                              </div>
                              <div className="flex items-center justify-center">
                                <FontAwesomeIcon
                                  icon={faUserDoctor}
                                  className="pe-1 text-blue-900"
                                />
                                <p>{a.doctor_name}</p>
                              </div>
                              <div className="flex items-center justify-start">
                                <FontAwesomeIcon
                                  icon={faCalendar}
                                  className="pe-1 text-blue-900"
                                />
                                <p>{a.date}</p>
                              </div>
                              <div className="flex items-center justify-start">
                                <FontAwesomeIcon
                                  icon={faClock}
                                  className="pe-1 text-blue-900"
                                />
                                <p>{a.time_range}</p>
                              </div>
                              <div className="flex items-center justify-start">
                                {a.note ? (
                                  <>
                                    <FontAwesomeIcon
                                      icon={faNoteSticky}
                                      className="pe-1 text-blue-900"
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
                              className={`text-md inline-block rounded-full px-3 py-1 font-bold ${
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
                                ? "รอดำเนินการ"
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
                          <p className="mt-1 text-center">
                            ไม่ได้เช็คอินที่คลินิกภายใน 10 นาทีหลังเริ่มบริการ
                          </p>
                        ) : a.status === "complete" ? (
                          <p className="mt-1 text-center">
                            เสร็จสิ้นการรับบริการ
                          </p>
                        ) : (
                          ""
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="pt-5 text-center">
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
