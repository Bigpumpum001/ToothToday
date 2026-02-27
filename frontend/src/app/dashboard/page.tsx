"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import AppointmentsManagement from "@/components/features/dashboard/AppointmentsManagement";

type TokenPayload = {
  exp: number;
  role: string;
  user_id: number;
};

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);
      if (decoded.role !== "admin") {
        router.push("/");
      }
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
      router.push("/login");
    }
  }, [router]);

  return (
    <DashboardLayout activePage="appointments">
      <AppointmentsManagement />
    </DashboardLayout>
  );
}
