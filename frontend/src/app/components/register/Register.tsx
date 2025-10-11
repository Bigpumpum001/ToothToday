"use client";
import React, { useState, FormEvent } from "react";
import { register } from "@/app/lib/api";
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
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // ลบตัวอักษรที่ไม่ใช่ ASCII
    value = value.replace(/[^\x00-\x7F]/g, "");

    setEmail(value);
  };
  const handleSubmit = async (e: FormEvent) => {
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
      console.log(data);
      // if (data.success) {
      Swal.fire({
        icon: "success",
        title: "สมัครสมาชิกสำเร็จ!",
        text: "กรุณาเข้าสู่ระบบเพื่อใช้งาน",
        confirmButtonText: "ตกลง",
      });
      router.push("/login");
      // } else alert(data.error || "Register failed");
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
    // <div className="min-h-screen flex items-center justify-center bg-blue-50">
    //   <div className="bg-white p-6 rounded-2xl shadow-md w-96 space-y-4">
    //     <form
    //       onSubmit={handleSubmit}
    //       className="space-y-4"
    //     >
    //       <h2 className="text-3xl font-bold text-blue-900 text-center">
    //         Register
    //       </h2>
    //       <input
    //         type="text"
    //         placeholder="Name"
    //         value={name}
    //         onChange={(e) => setName(e.target.value)}
    //         className="w-full p-2 border border-gray-300  rounded-2xl"
    //         required
    //       />
    //       <input
    //         type="email"
    //         placeholder="Email"
    //         value={email}
    //         onChange={(e) => setEmail(e.target.value)}
    //         className="w-full p-2 border border-gray-300  rounded-2xl"
    //         required
    //       />
    //       <input
    //         type="phone"
    //         placeholder="Phone"
    //         value={phone}
    //         onChange={(e) => setPhone(e.target.value)}
    //         className="w-full p-2 border border-gray-300  rounded-2xl"
    //         required
    //       />
    //       <input
    //         type="password"
    //         placeholder="Password"
    //         value={password}
    //         onChange={(e) => setPassword(e.target.value)}
    //         className="w-full p-2 border border-gray-300  rounded-2xl"
    //         required
    //       />
    //       <button
    //         type="submit"
    //         className="w-full bg-blue-900 text-white p-2 rounded-lg"
    //       >
    //         Register
    //       </button>
    //     </form>
    //     <div className="text-center text-gray-700">
    //       Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Login here</Link>
    //     </div>
    //   </div>
    // </div>

    // แบบ2
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 pt-25">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-5xl space-y-6">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="flex justify-center items-center">
            <Image
              className="object-cover border border-white rounded-3xl"
              src="/images/logo/logo_cartoon5.jpg"
              alt=""
              width={400}
              height={400}
            />
          </div>

          <div className="space-y-4">
            <div className="">
              <h2 className="text-3xl font-extrabold text-blue-900 text-center">
                Create Account
              </h2>
              <p className="text-gray-700 text-center">
                Register now and manage your dental queue anytime, anywhere.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="relative">
                <User
                  className="absolute left-3 top-4 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail
                  className="absolute left-3 top-4 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <Phone
                  className="absolute left-3 top-4 text-gray-400"
                  size={18}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock
                  className="absolute left-3 top-4 text-gray-400"
                  size={18}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>
              {/* Confirm Password */}
              <div className="relative">
                <Lock
                  className="absolute left-3 top-4 text-gray-400"
                  size={18}
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800 text-white p-3 rounded-2xl font-semibold shadow-md transition-all duration-200 hover:shadow-lg"
              >
                Register
              </button>
            </form>

            <p className="text-center text-gray-700">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:underline font-medium"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>

    // <div className="flex min-h-screen bg-[#0d0f1a] text-white">
    //   {/* ด้านซ้าย: ข้อความ */}
    //   <div className="hidden md:flex flex-col justify-center w-1/2 px-12">
    //     <h2 className="text-4xl font-bold leading-snug">
    //       Book your <span className="text-blue-400">dental appointment</span>{" "}
    //       easily.
    //     </h2>
    //     <p className="mt-4 text-gray-400">
    //       Register now and manage your dental queue anytime, anywhere.
    //     </p>
    //   </div>

    //   {/* ด้านขวา: ฟอร์ม */}
    //   <div className="flex items-center justify-center w-full md:w-1/2 p-6">
    //     <form
    //       onSubmit={handleSubmit}
    //       className="bg-[#151823] w-full max-w-md p-8 rounded-2xl shadow-lg"
    //     >
    //       <h2 className="text-2xl font-bold mb-6 text-center">
    //         Create Account
    //       </h2>

    //       <input
    //         type="text"
    //         placeholder="Full Name"
    //         className="w-full mb-4 p-3 rounded-xl bg-[#1f2233] text-white outline-none focus:ring-2 focus:ring-blue-400"
    //         value={name}
    //         onChange={(e) => setName(e.target.value)}
    //         required
    //       />

    //       <input
    //         type="email"
    //         placeholder="Email"
    //         className="w-full mb-4 p-3 rounded-xl bg-[#1f2233] text-white outline-none focus:ring-2 focus:ring-blue-400"
    //         value={email}
    //         onChange={(e) => setEmail(e.target.value)}
    //         required
    //       />

    //       <input
    //         type="password"
    //         placeholder="Password"
    //         className="w-full mb-6 p-3 rounded-xl bg-[#1f2233] text-white outline-none focus:ring-2 focus:ring-blue-400"
    //         value={password}
    //         onChange={(e) => setPassword(e.target.value)}
    //         required
    //       />

    //       <button
    //         type="submit"

    //         className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
    //       >

    //       </button>

    //       <p className="text-center mt-4 text-sm text-gray-400">
    //         Already have an account?{" "}
    //         <a href="/login" className="text-blue-400 hover:underline">
    //           Log in
    //         </a>
    //       </p>
    //     </form>
    //   </div>
    // </div>
  );
}

export default Register;
