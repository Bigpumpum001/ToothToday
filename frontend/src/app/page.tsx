"use client";
import Header from "../components/common/Header";
import HeroSection from "../components/features/home/HeroSection";
import WhyUsSection from "../components/features/home/WhyUsSection";
import AppointmentStep from "../components/features/home/AppointmentStep";
import ServicesSection from "../components/features/home/ServicesSection";
import DoctorsSection from "../components/features/home/DoctorsSection";
import LocationSection from "../components/features/home/LocationSection";
import Footer from "../components/common/Footer";

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
