"use client";
import React, { useState, FormEvent } from "react";
import { login } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock } from "lucide-react";
import Swal from "sweetalert2";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const Submit = async (e: FormEvent) => {
    e.preventDefault();
    const data = await login({ email, password });
    // console.log(data);
    if (data.token) {
      localStorage.setItem("token", data.token);
      Swal.fire({
        icon: "success",
        title: "Login Success!",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        router.push("/booking");
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: data.error,
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
              src="/images/logo/logo_cartoon6.jpg"
              alt=""
              width={400}
              height={400}
            />
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <form onSubmit={Submit} className="space-y-4">
              <div className="">
                <h2 className="text-center text-3xl font-bold text-blue-900">
                  Login
                </h2>
                <p className="text-center text-gray-700">
                  Log in to access your account and manage your dental
                  appointments anytime, anywhere.{" "}
                </p>
              </div>

              <div className="relative">
                <Mail
                  className="absolute top-4 left-3 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 p-2 pl-10 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>
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
                  className="w-full rounded-2xl border border-gray-300 p-2 pl-10 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-900 p-2 text-white"
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
