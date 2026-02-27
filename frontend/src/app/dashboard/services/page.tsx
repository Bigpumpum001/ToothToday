"use client";
import DashboardLayout from "@/components/features/dashboard/DashboardLayout";
import ServicesManagement from "@/components/features/dashboard/ServicesManagement";

export default function ServicesPage() {
  return (
    <DashboardLayout activePage="services">
      <ServicesManagement />
    </DashboardLayout>
  );
}