"use client";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import DoctorsManagement from "@/app/components/dashboard/DoctorsManagement";

export default function DoctorsPage() {
  return (
    <DashboardLayout activePage="doctors">
      <DoctorsManagement />
    </DashboardLayout>
  );
}