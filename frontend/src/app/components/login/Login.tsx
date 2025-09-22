"use client";
import React, { useState, FormEvent } from "react";
import { login } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data = await login({ email, password });
    console.log(data);
    if (data.token) {
      localStorage.setItem("token", data.token);
      alert("Login Success!");
      router.push("/");
    } else alert(data.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 pt-25">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-5xl space-y-6">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="flex justify-center items-center">
            <Image
              className="object-cover border rounded-lg"
              src="/images/logo/logo_form.png"
              alt=""
              width={400}
              height={400}
            />
          </div>
          <div className="space-y-4  flex justify-center  flex-col">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="">
                <h2 className="text-3xl font-bold text-blue-900 text-center">
                  Login
                </h2>
                <p className="text-gray-700 text-center">
Log in to access your account and manage your dental appointments anytime, anywhere.                </p>
              </div>

              <div className="relative">
                <Mail
                  className="absolute left-3 top-4 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 p-2 border border-gray-300  rounded-2xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>
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
                  className="w-full pl-10 p-2 border border-gray-300  rounded-2xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-900 text-white p-2 rounded-lg"
              >
                Login
              </button>
            </form>

            <div className="text-center text-gray-700">
              Dont have an account?{" "}
              <Link href="/register" className="text-blue-500 hover:underline">
                Register here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
