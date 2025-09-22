"use client"
import BookingForm from '../components/booking/BookingForm'
import React from 'react'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
export default function BookingPage() {
  return (
  <>
    <Header />
    <div className='mt-29 min-h-screen bg-gray-50 py-10 px-4 md:px-20'>
      <h1 className='text-blue-900 text-4xl font-semibold text-center mb-8'>จองคิวคลินิกฟัน</h1>
      <BookingForm/>
    </div>
    <Footer />
  </>
  )
}

 
