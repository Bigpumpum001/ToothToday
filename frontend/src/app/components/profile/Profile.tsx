"use client";
import React, { useEffect, useState, FormEvent } from "react";
import api from "@/app/lib/api";
import { ProfileData, ProfileAppointment } from "@/app/types/user";
import { jwtDecode } from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import Image from "next/image";
type TokenPayload = {
  exp: number;
  role: string;
  user_id: number;
};

function Profile() {
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
        // console.log("fs", formData);
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
    <div className="min-h-screen bg-blue-50 flex items-center justify-center mt-20">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold text-blue-900 text-center">
            Profile
          </h2>
          {editing ? (
            <button
              onClick={handleSave}
              className=" px-4 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200 shadow-sm"
            >
              <FontAwesomeIcon icon={faFloppyDisk} /> Save
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 shadow-sm px-4 py-1 rounded "
            >
              <FontAwesomeIcon icon={faPenToSquare} /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className=" ">
            <div className="grid grid-cols-2 space-y-3 text-left">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border border-gray-400 p-1 pl-2 rounded-lg w-50"
                placeholder="Name"
              />
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="border border-gray-400  p-1 pl-2 rounded-lg w-50"
                placeholder="Email"
              />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="border border-gray-400 p-1 pl-2 rounded-lg w-50"
                placeholder="Phone"
              />
              <input
                name="chronic_disease"
                value={formData.chronic_disease}
                onChange={handleChange}
                className="border border-gray-400 p-1 pl-2 rounded-lg w-50"
                placeholder="โรคประจำตัว"
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
          </div>
        ) : (
          <div className=" text-center">
            <div className="grid grid-cols-2 space-y-3 text-left">
              <p className="text-gray-700 text-lg">
                <strong>Name:</strong> {profile?.name}
              </p>
              <p className="text-gray-700 text-lg">
                <strong>Email:</strong> {profile?.email}
              </p>
              <p className="text-gray-700 text-lg">
                <strong>Phone:</strong> {profile?.phone}
              </p>
              <p className="text-gray-700 text-lg">
                <strong>โรคประจำตัว:</strong>{" "}
                {profile?.chronic_disease ? profile.chronic_disease : ""}
              </p>
              <p className="text-gray-700 text-lg">
                <strong>Age:</strong> {profile?.age != null ? profile.age : ""}
              </p>
              {isAdmin && (
                <p className="text-red-500  text-lg">
                  <strong className="text-black">Status:</strong>{" "}
                  {profile?.role}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ประวัติการนัดปัจจุบัน */}
        <div className="">
          <h3 className="font-bold mt-4 mb-3">ประวัติการนัดปัจจุบัน</h3>
          {appointments
            .filter((a) => a.status === "current")
            .map((a) => (
              <div
                key={a.id}
                className="border border-blue-300 rounded-2xl p-3 mb-2 bg-green-100 text-green-800"
              >
                <p>
                  <span className="text-blue-900 font-semibold">
                    {a.time_range}
                  </span>
                  {" | "}
                  {a.date} {" | "} {a.doctor_name} ({a.service_name}){" "}
                  {a.note ? a.note : ""}
                  {a.image_url ? (
                    <span className="flex justify-center items-center">
                      <Image
                        src={a.image_url ? a.image_url : ""}
                        alt=""
                        width={200}
                        height={200}
                        priority
                        className="rounded-xl mt-2"
                      />
                    </span>
                  ) : (
                    ""
                  )}
                </p>
              </div>
            ))}
        </div>

        {/* ประวัติการนัดในอดีต */}
        <div className="">
          <h3 className="font-bold mt-4 mb-3">ประวัติการนัดในอดีต</h3>
          {appointments
            .filter((a) => a.status === "past")
            .map((a) => (
              <div
                key={a.id}
                className="border border-gray-300 rounded-2xl p-3 mb-2 bg-gray-100 text-gray-600"
              >
                <p>
                  <span className="text-blue-900 font-semibold">
                    {a.time_range}
                  </span>
                  {" | "}
                  {a.date} {" | "} {a.doctor_name} ({a.service_name}){" "}
                  {a.note ? a.note : ""}
                  {a.image_url ? (
                    <span className="flex justify-center items-center">
                      <Image
                        src={a.image_url ? a.image_url : ""}
                        alt=""
                        width={200}
                        height={200}
                        priority
                        className="rounded-xl mt-2"
                      />
                    </span>
                  ) : (
                    ""
                  )}
                </p>
              </div>
            ))}
        </div>

        {/* ปุ่มเชื่อมไลน์ */}
        <button className="bg-green-500 text-white px-4 py-1 rounded mt-4">
          เชื่อมไลน์ (soon)
        </button>
      </div>
    </div>
  );
}

export default Profile;
