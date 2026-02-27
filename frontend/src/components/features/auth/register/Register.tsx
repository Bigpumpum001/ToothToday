"use client";
import React, { useState, FormEvent } from "react";
import { register } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, Lock } from "lucide-react";
import Image from "next/image";
import Swal from "sweetalert2";
function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();
  const EmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // ลบตัวอักษรที่ไม่ใช่ ASCII
    value = value.replace(/[^\x00-\x7F]/g, "");

    setEmail(value);
  };
  const Submit = async (e: FormEvent) => {
    e.preventDefault();
    const isValidEmail = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const asciiOnly = /^[\x00-\x7F]+$/;

    if (!isValidEmail.test(email) || !asciiOnly.test(email)) {
      Swal.fire({
        icon: "error",
        title: "อีเมลไม่ถูกต้อง",
        text: "กรุณากรอกอีเมลเป็นภาษาอังกฤษเท่านั้น เช่น example@gmail.com",
        confirmButtonText: "ตกลง",
      });
      return;
    }
    const phonePattern = /^[0-9]{9,10}$/;
    if (!phonePattern.test(phone)) {
      Swal.fire({
        icon: "error",
        title: "เบอร์ไม่ถูกต้อง",
        text: "กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง (9–10 หลัก)",
        confirmButtonText: "ตกลง",
      });
      return;
    }
    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "รหัสผ่านไม่ถูกต้อง",
        text: "รหัสผ่านไม่ตรงกัน",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    try {
      const data = await register({ name, email, password, phone });
      // console.log(data);
      Swal.fire({
        icon: "success",
        title: "สมัครสมาชิกสำเร็จ!",
        text: "กรุณาเข้าสู่ระบบเพื่อใช้งาน",
        confirmButtonText: "ตกลง",
      });
      router.push("/login");
    } catch (error) {
      console.error("Register error:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "เกิดปัญหาบางอย่าง กรุณาลองใหม่อีกครั้ง",
        confirmButtonText: "ตกลง",
      });
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 pt-25">
      <div className="w-full max-w-5xl space-y-6 rounded-3xl bg-white p-8 shadow-xl">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex items-center justify-center">
            <Image
              className="rounded-3xl border border-white object-cover"
              src="/images/logo/logo_cartoon5.jpg"
              alt=""
              width={400}
              height={400}
            />
          </div>

          <div className="space-y-4">
            <div className="">
              <h2 className="text-center text-3xl font-extrabold text-blue-900">
                Create Account
              </h2>
              <p className="text-center text-gray-700">
                Register now and manage your dental queue anytime, anywhere.
              </p>
            </div>

            <form onSubmit={Submit} className="space-y-4">
              {/* Name */}
              <div className="relative">
                <User
                  className="absolute top-4 left-3 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 p-3 pl-10 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail
                  className="absolute top-4 left-3 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={EmailInput}
                  className="w-full rounded-2xl border border-gray-300 p-3 pl-10 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <Phone
                  className="absolute top-4 left-3 text-gray-400"
                  size={18}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => {
                    // กรองเฉพาะตัวเลข 0-9 และจำกัดความยาวสูงสุด 10 หลัก
                    const value = e.target.value
                      .replace(/[^0-9]/g, "")
                      .slice(0, 10);
                    setPhone(value);
                  }}
                  className="w-full rounded-2xl border border-gray-300 p-3 pl-10 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock
                  className="absolute top-4 left-3 text-gray-400"
                  size={18}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 p-3 pl-10 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>
              {/* Confirm Password */}
              <div className="relative">
                <Lock
                  className="absolute top-4 left-3 text-gray-400"
                  size={18}
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 p-3 pl-10 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-900 p-3 font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-800 hover:shadow-lg"
              >
                Register
              </button>
            </form>

            <p className="text-center text-gray-700">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
