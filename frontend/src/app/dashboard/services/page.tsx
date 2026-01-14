"use client";
import DashboardLayout from "@/app/components/dashboard/DashboardLayout";
import ServicesManagement from "@/app/components/dashboard/ServicesManagement";

export default function ServicesPage() {
  return (
    <DashboardLayout activePage="services">
      <ServicesManagement />
    </DashboardLayout>
  );
}