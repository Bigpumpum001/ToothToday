import React from "react";
import Link from "next/link";
function Footer() {
  return (
    <footer className="bg-gray-900 py-7 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
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

          <div className="text-center md:text-left">
            <h4 className="mb-4 font-semibold">บริการ</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/booking" className="hover:text-white">
                  จองคิวออนไลน์
                </Link>
              </li>
              <li>
                <Link href="/queue" className="hover:text-white">
                  ตรวจสอบคิว
                </Link>
              </li>
              {/* <li>
                <Link href="#" className="hover:text-white">
                  จัดการคิว *soon
                </Link>
              </li> */}
            </ul>
          </div>

          {/* <div>
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
          </div> */}

          <div className="text-center md:text-left">
            <h4 className="mb-4 font-semibold">ติดต่อเรา</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>โทร: 02-xxx-xxxx</li>
              <li>อีเมล: info@toothtoday.com</li>
              <li>Line: @ToothToday</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 ToothToday. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
