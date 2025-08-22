import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-7">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* <div>
            <div className="bg-teal-500 text-white px-3 py-1 rounded text-sm font-medium inline-block mb-4">
              ToothToday
            </div>
            <p className="text-gray-400 text-sm">
              ระบบจองคิวทันตกรรมออนไลน์
              <br />
              ที่ใช้งานง่ายและสะดวกที่สุด
            </p>
          </div> */}

          <div className="">
            <h4 className="font-semibold mb-4">บริการ</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  จองคิวออนไลน์
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  ตรวจสอบคิว
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  จัดการคิว
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">สำหรับคลินิก</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  ลงทะเบียนคลินิก
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  จัดการระบบ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  รายงาน
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">ติดต่อเรา</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>โทร: 02-xxx-xxxx</li>
              <li>อีเมล: info@toothtoday.com</li>
              <li>Line: @ToothToday</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 ToothToday. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
