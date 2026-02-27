"use client"
import React from 'react'
import Header from '../../components/common/Header'
import Footer from '../../components/common/Footer'
import About from '../../components/features/about/About'
import ServicesSection from '../../components/features/home/ServicesSection'
function page() {
  return (
    <>
    <Header />
    <div className='mt-29 min-h-screen bg-white py-10 px-4 md:px-20'>
      <h1 className='text-blue-900 text-4xl font-semibold text-center mb-8'>เกี่ยวกับเรา</h1>
      <About/>
      <ServicesSection/>
    </div>
    <Footer />
  </>
  )
}

export default page