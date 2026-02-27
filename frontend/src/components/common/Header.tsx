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
    <div className="fixed top-0 left-0 z-50 w-full">
      <Topbar />

      <nav className="flex flex-col bg-white p-4 md:flex-row">
        <div className="container mx-auto flex items-center justify-between">
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
            className="text-blue-900 md:hidden"
            onClick={toggleMenu}
          >
            <svg
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
              className="h-6 w-6"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          {/* </div> */}

          <ul className="hidden space-x-8 px-2 md:flex">
            <li>
              <Link
                href="/"
                className="text-lg font-semibold text-blue-900 hover:text-blue-700"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/booking"
                className="text-lg font-semibold text-blue-900 hover:text-blue-700"
              >
                Booking
              </Link>
            </li>
            <li>
              <Link
                href="/queue"
                className="text-lg font-semibold text-blue-900 hover:text-blue-700"
              >
                Queue
              </Link>
            </li>
            <li>
              <Link
                href="/services"
                className="text-lg font-semibold text-blue-900 hover:text-blue-700"
              >
                Services
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="text-lg font-semibold text-blue-900 hover:text-blue-700"
              >
                About
              </Link>
            </li>

            {isLoggedIn ? (
              <>
                <li>
                  <Link
                    href="/profile"
                    className="text-lg font-semibold text-blue-900 hover:text-blue-700"
                  >
                    Profile
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link
                      href="/dashboard"
                      className="text-lg font-semibold text-blue-900 hover:text-blue-700"
                    >
                      Panel
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={Logout}
                    className="text-lg font-semibold text-blue-900 hover:text-blue-700"
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
                    className="text-lg font-semibold text-blue-900 hover:text-blue-700"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="text-lg font-semibold text-blue-900 hover:text-blue-700"
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
          <div className="container mx-auto flex items-center md:hidden">
            <ul className="block w-full">
              <li className="py-2 text-center">
                <Link href="/" className="text-lg font-semibold text-blue-900">
                  Home
                </Link>
              </li>
              <li className="py-2 text-center">
                <Link
                  href="/booking"
                  className="text-lg font-semibold text-blue-900"
                >
                  Booking
                </Link>
              </li>
              <li className="py-2 text-center">
                <Link
                  href="/queue"
                  className="text-lg font-semibold text-blue-900"
                >
                  Queue
                </Link>
              </li>

              <li className="py-2 text-center">
                <Link
                  href="/services"
                  className="text-lg font-semibold text-blue-900"
                >
                  Services
                </Link>
              </li>
              <li className="py-2 text-center">
                <Link
                  href="/about"
                  className="text-lg font-semibold text-blue-900"
                >
                  About
                </Link>
              </li>
              {isLoggedIn ? (
                <>
                  <li className="py-2 text-center">
                    <Link
                      href="/profile"
                      className="text-lg font-semibold text-blue-900"
                    >
                      Profile
                    </Link>
                  </li>
                  {isAdmin && (
                    <li className="py-2 text-center">
                      <Link
                        href="/dashboard"
                        className="text-lg font-semibold text-blue-900"
                      >
                        Panel
                      </Link>
                    </li>
                  )}
                  <li className="py-2 text-center">
                    <button
                      onClick={Logout}
                      className="text-lg font-semibold text-blue-900"
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
                      className="text-lg font-semibold text-blue-900"
                    >
                      Login
                    </Link>
                  </li>
                  <li className="py-2 text-center">
                    <Link
                      href="/register"
                      className="text-lg font-semibold text-blue-900"
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
