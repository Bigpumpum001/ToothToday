import React, { useState, useEffect } from "react";
import Image from "next/image";
import Topbar from "./Topbar";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";

type TokenPayload = {
  exp: number;
  role: string;
  user_id: number;
};
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      try {
        const decoded: TokenPayload = jwtDecode(token);
        setIsAdmin(decoded.role === "admin");
      } catch (err) {
        console.error("Invalid token", err);
        setIsAdmin(false);
      }
    }
  }, []);

  const Logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.location.href = "/";
  };
  return (
    <div className="fixed top-0 left-0 w-full z-50 ">
      <Topbar />

      <nav className="  flex flex-col md:flex-row  p-4 bg-white ">
        <div className="container mx-auto flex items-center justify-between    ">
          <Link href="/" className="flex">
            <Image
              className="object-contain"
              src="/images/logo/logo2.png"
              alt=""
              width={150}
              height={150}
            />
          </Link>

          {/* Toggle Hamburger Menu Button */}
          {/* <div className="block md:hidden"> */}
          <button
            id="menu-toggle"
            className="text-blue-900  md:hidden"
            onClick={toggleMenu}
          >
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
              <Link
                href="/"
                className="text-blue-900 hover:text-blue-700  text-lg  font-semibold"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/booking"
                className="text-blue-900 hover:text-blue-700 text-lg  font-semibold"
              >
                Booking
              </Link>
            </li>
            <li>
              <Link
                href="/queue"
                className="text-blue-900 hover:text-blue-700 text-lg font-semibold"
              >
                Queue
              </Link>
            </li>
            <li>
              <Link
                href="/services"
                className="text-blue-900 hover:text-blue-700 text-lg font-semibold"
              >
                Services
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="text-blue-900 hover:text-blue-700 text-lg font-semibold"
              >
                About
              </Link>
            </li>

            {isLoggedIn ? (
              <>
                <li>
                  <Link
                    href="/profile"
                    className="text-blue-900 hover:text-blue-700 text-lg font-semibold"
                  >
                    Profile
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link
                      href="/dashboard"
                      className="text-blue-900 hover:text-blue-700 text-lg font-semibold"
                    >
                      Panel
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={Logout}
                    className="text-blue-900 hover:text-blue-700 text-lg font-semibold"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    className="text-blue-900 hover:text-blue-700 text-lg font-semibold"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="text-blue-900 hover:text-blue-700 text-lg font-semibold"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
        {/* mobile Menu */}
        {isMenuOpen ? (
          <div className="md:hidden  container mx-auto flex items-center     ">
            <ul className=" w-full block">
              <li className="py-2 text-center">
                <Link href="/" className="text-blue-900 text-lg font-semibold">
                  Home
                </Link>
              </li>
              <li className="py-2 text-center">
                <Link
                  href="/booking"
                  className="text-blue-900 text-lg font-semibold"
                >
                  Booking
                </Link>
              </li>
              <li className="py-2 text-center">
                <Link
                  href="/queue"
                  className="text-blue-900 text-lg font-semibold"
                >
                  Queue
                </Link>
              </li>

              <li className="py-2 text-center">
                <Link
                  href="/services"
                  className="text-blue-900 text-lg font-semibold"
                >
                  Services
                </Link>
              </li>
              <li className="py-2 text-center">
                <Link
                  href="/about"
                  className="text-blue-900 text-lg font-semibold"
                >
                  About
                </Link>
              </li>
              {isLoggedIn ? (
                <>
                  <li className="py-2 text-center">
                    <Link
                      href="/profile"
                      className="text-blue-900 text-lg font-semibold "
                    >
                      Profile
                    </Link>
                  </li>
                  {isAdmin && (
                    <li className="py-2 text-center">
                      <Link
                        href="/dashboard"
                        className="text-blue-900 text-lg font-semibold "
                      >
                        Panel
                      </Link>
                    </li>
                  )}
                  <li className="py-2 text-center">
                    <button
                      onClick={Logout}
                      className="text-blue-900 text-lg font-semibold "
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="py-2 text-center">
                    <Link
                      href="/login"
                      className="text-blue-900 text-lg font-semibold "
                    >
                      Login
                    </Link>
                  </li>
                  <li className="py-2 text-center">
                    <Link
                      href="/register"
                      className="text-blue-900 text-lg font-semibold "
                    >
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        ) : null}
      </nav>
    </div>
  );
}

export default Header;
