import React, { useState } from "react";
import Image from "next/image";
import Topbar from "./Topbar";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <Topbar />

      <nav className="  flex flex-col md:flex-row  p-4 bg-white ">
        <div className="container mx-auto flex items-center justify-between    ">
          <a href="#" className="flex">
            <Image className="object-contain"
              src="/images/logo/logo.png"
              alt=""
              width={150}
              height={150}
            />
          </a>

          {/* Toggle Hamburger Menu Button */}
          {/* <div className="block md:hidden"> */}
          <button id="menu-toggle" className="text-blue-900  md:hidden" onClick={toggleMenu}>
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
          {/* </div> */}

          <ul className="hidden md:flex space-x-8 px-2">
            <li>
              <a href="#" className="text-blue-900 hover:text-blue-700  text-lg  font-semibold">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="text-blue-900 hover:text-blue-700 text-lg  font-semibold">
                Queue
              </a>
            </li>
            <li>
              <a href="#" className="text-blue-900 hover:text-blue-700 text-lg font-semibold">
                Services
              </a>
            </li>
            <li>
              <a href="#" className="text-blue-900 hover:text-blue-700 text-lg font-semibold">
                Contact
              </a>
            </li>
            <li>
              <a href="#" className="text-blue-900 hover:text-blue-700 text-lg font-semibold">
                Login
              </a>
            </li>
          </ul>
        </div>
        {/* mobile Menu */}
        {isMenuOpen ? (
          <div className="md:hidden  container mx-auto flex items-center     ">

            <ul className=" w-full block">
              <li className="py-2 text-center">
                <a href="#" className="text-blue-900 text-lg font-semibold">
                  Home
                </a>
              </li>
              <li className="py-2 text-center">
                <a href="#" className="text-blue-900 text-lg font-semibold">
                  Queue
                </a>
              </li>
              <li className="py-2 text-center">
                <a href="#" className="text-blue-900 text-lg font-semibold">
                  Services
                </a>
              </li>
              <li className="py-2 text-center">
                <a href="#" className="text-blue-900 text-lg font-semibold">
                  Contact
                </a>
              </li>
              <li className="py-2 text-center">
                <a href="#" className="text-blue-900 text-lg font-semibold ">
                  Login
                </a>
              </li>
            </ul>
          </div>
        ) : null}
      </nav>
    </div>
  );
}

export default Header

