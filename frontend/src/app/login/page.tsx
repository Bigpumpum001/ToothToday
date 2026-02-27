"use client";
import React from "react";
import Header from "../../components/common/Header";
import Footer from "../../components/common/Footer";
import Login from "../../components/features/auth/login/Login";
function page() {
  return (
    <>
      <Header />
      <Login />
      <Footer />
    </>
  );
}

export default page;
