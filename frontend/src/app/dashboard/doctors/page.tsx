"use client";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import DoctorsManagement from "@/components/features/dashboard/DoctorsManagement";

export default function DoctorsPage() {
  return (
    <DashboardLayout activePage="doctors">
      <DoctorsManagement />
    </DashboardLayout>
  );
}