"use client";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import AppointmentsManagement from "@/app/components/dashboard/AppointmentsManagement";

export default function AppointmentsPage() {
  return (
    <DashboardLayout activePage="appointments">
      <AppointmentsManagement />
    </DashboardLayout>
  );
}