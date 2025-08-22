"use client";
import Header from "./components/common/Header";
import HeroSection from "./components/home/HeroSection";
import WhyUsSection from "./components/home/WhyUsSection";
import AppointmentStep from "./components/home/AppointmentStep";
import ServicesSection from "./components/home/ServicesSection";
import DoctorsSection from "./components/home/DoctorsSection";
import LocationSection from "./components/home/LocationSection";
import Footer from "./components/common/Footer";
import Queue4Dentist from "./components/Queue4Dentist";
import BookingPreview from "./components/BookingPreview"

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <WhyUsSection/>
      <AppointmentStep/>
      {/* <BookingPreview/> */}
      <ServicesSection />
      <DoctorsSection/>
      <LocationSection/>
      <Footer/>
      {/* <Queue4Dentist /> */}

    </>
  );
}
