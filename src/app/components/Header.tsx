import React, { useState } from "react";
import Image from "next/image";
import logo from '/src/app/img/logo.png'
import Topbar from "./Topbar";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <Topbar />

      <nav className="  flex  p-4 bg-white">
        <div className="flex items-center justify-between container mx-auto px-5 ">
          <div className="flex">
            <Image className="object-contain"
              // src={logo}
              src={logo}
              alt=""
              width={150}
              height={150}
            />
            {/* <div className="text-blue-900 text-2xl font-bold">ReactTailwind</div> */}
          </div>

          {/* Toggle Menu Button */}
          <div className="md:hidden">
            <button id="menu-toggle" className="text-blue-900" onClick={toggleMenu}>
              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                viewBox="0 0 24 24"
                className="w-6 h-6"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
          {/* tailwnd -> mobile first space-x-8*/}
          <ul className="hidden md:flex space-x-8">
            <li>
              <a href="#" className="text-blue-900 text-lg font-semibold">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="text-blue-900 text-lg font-semibold">
                Queue
              </a>
            </li>
            <li>
              <a href="#" className="text-blue-900 text-lg font-semibold">
                Services
              </a>
            </li>
            <li>
              <a href="#" className="text-blue-900 text-lg font-semibold">
                Contact
              </a>
            </li>
            <li>
              <a href="#" className="text-blue-900 text-lg font-semibold">
                Login
              </a>
            </li>
          </ul>
        </div>
        {/* mobile Menu */}
        {isMenuOpen ? (
          <ul className="md:hidden flex-col">
            <li className="py-2">
              <a href="#" className="text-blue-900 font-semibold">
                Home
              </a>
            </li>
            <li className="py-2">
              <a href="#" className="text-blue-900 font-semibold">
                Queue
              </a>
            </li>
            <li className="py-2">
              <a href="#" className="text-blue-900 font-semibold">
                Services
              </a>
            </li>
            <li className="py-2">
              <a href="#" className="text-blue-900 font-semibold">
                Contact
              </a>
            </li>
            <li className="py-2">
              <a href="#" className="text-blue-900 font-semibold ">
                Login
              </a>
            </li>
          </ul>
        ) : null}
      </nav>
    </div>
  );
}

export default Header

