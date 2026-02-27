"use client";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import AppointmentsManagement from "@/components/features/dashboard/AppointmentsManagement";

export default function AppointmentsPage() {
  return (
    <DashboardLayout activePage="appointments">
      <AppointmentsManagement />
    </DashboardLayout>
  );
}