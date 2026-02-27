"use client";
import React from "react";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import Allservices from "../../components/features/services/Allservices";
function page() {
  return (
    <>
      <Header />
      <div className="mt-29 min-h-screen px-4 py-10 md:px-20">
        <h1 className="text-center text-4xl font-semibold text-blue-900">
          บริการทั้งหมดของเรา
        </h1>
        <Allservices />
      </div>
      <Footer />
    </>
  );
}

export default page;
