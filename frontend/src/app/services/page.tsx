"use client"
import React from 'react'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import Allservices from '../components/services/Allservices'
function page() {
  return (
    <>
    <Header />
    <div className='mt-29 min-h-screen  py-10 px-4 md:px-20'>
      <h1 className='text-blue-900 text-4xl font-semibold text-center '>บริการทั้งหมดของเรา</h1>
      <Allservices/>
    </div>
    <Footer />
    </>
  )
}

export default page