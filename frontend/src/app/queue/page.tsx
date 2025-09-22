"use client"
import React from 'react'
import DoctorSchedule from '../components/queue/DoctorSchedule'
import Footer from '../components/common/Footer'
import Header from '../components/common/Header'
function page() {
  return (
    <>
    <Header />
    <div className='mt-29 min-h-screen bg-gray-100 py-10 px-4 md:px-20'>
      <h1 className='text-blue-900 text-4xl font-semibold text-center mb-8'>Queue</h1>
      <DoctorSchedule/>
    </div>
    <Footer />
    </>
  )
}

export default page