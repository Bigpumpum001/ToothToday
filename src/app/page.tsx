"use client";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import Queue4Dentist from "./components/Queue4Dentist";
import WhyUsSection from "./components/WhyUsSection";
import BookingPreview from "./components/BookingPreview"
import ServicesSection from "./components/ServicesSection";
import DoctorsSection from "./components/DoctorsSection";
import Footer from "./components/Footer";
import LocationSection from "./components/LocationSection";
import AppointmentStep from "./components/AppointmentStep";
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
