"use client";
import Header from "./components/common/Header";
import HeroSection from "./components/home/HeroSection";
import WhyUsSection from "./components/home/WhyUsSection";
import AppointmentStep from "./components/home/AppointmentStep";
import ServicesSection from "./components/home/ServicesSection";
import DoctorsSection from "./components/home/DoctorsSection";
import LocationSection from "./components/home/LocationSection";
import Footer from "./components/common/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <WhyUsSection/>
      <AppointmentStep/>
      <ServicesSection />
      <DoctorsSection/>
      <LocationSection/>
      <Footer/>

    </>
  );
}
