"use client";
import React from "react";
import DoctorSchedule from "../../components/features/queue/DoctorSchedule";
import Footer from "../../components/common/Footer";
import Header from "../../components/common/Header";
function page() {
  return (
    <>
      <Header />
      <div className="mt-29 min-h-screen bg-blue-50 px-4 py-10 md:px-20">
        <h1 className="mb-5 text-center text-4xl font-semibold text-blue-900">
          ตารางคิวแพทย์รายวัน
        </h1>
        <DoctorSchedule />
      </div>
      <Footer />
    </>
  );
}

export default page;
