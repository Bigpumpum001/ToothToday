import React from 'react'
import AppointmentStep from './AppointmentStep'
function BookingPreview() {
  return (
    <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <AppointmentStep  />
          <div className="mb-9"></div> */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                ใช้งานง่ายใน 1 นาที
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                ระบบใช้งานง่าย ใครๆ ก็สามารถใช้งานได้อย่างง่ายดาย
              </p>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">
                    1
                  </div>
                  <div className=''>
                    <h4 className="font-semibold text-gray-900">
                      เลือกคลินิกและประเภทการรักษา
                    </h4>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      เลือกวันและเวลาที่สะดวก
                    </h4>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      ยืนยันข้อมูล ยืนยันการจองและรอแจ้งเตือน
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Mockup */}
            <div className="relative">
              <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                <div className="bg-gray-100 p-4 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">คิวของฉัน</h3>
                    <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm">
                      กำลังรอ
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">คิว #15</span>
                        <span className="text-red-600 font-medium">
                          09:30 AM
                        </span>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">คิว #16</span>
                        <span className="text-yellow-600 font-medium">
                          10:00 AM
                        </span>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">คิว #17</span>
                        <span className="text-green-600 font-medium">
                          10:30 AM
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <div className="text-center text-sm text-gray-500">
                      เวลารอโดยประมาณ: 25 นาที
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}

export default BookingPreview
