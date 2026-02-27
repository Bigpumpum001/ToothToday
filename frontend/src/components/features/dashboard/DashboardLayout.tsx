"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";

type TokenPayload = {
  exp: number;
  role: string;
  user_id: number;
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  activePage: string;
}

const menuItems = [
  {
    id: "services",
    label: "Services",
    icon: "🦷",
    href: "/dashboard/services",
  },
  {
    id: "doctors",
    label: "Doctors",
    icon: "👨‍⚕️",
    href: "/dashboard/doctors",
  },
  {
    id: "appointments",
    label: "Appointments",
    icon: "📅",
    href: "/dashboard/appointments",
  },
];

export default function DashboardLayout({
  children,
  activePage,
}: DashboardLayoutProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default open on desktop
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-close sidebar on mobile, auto-open on desktop
      setSidebarOpen(!mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<TokenPayload>(token);
        setIsLoggedIn(true);
        setIsAdmin(decoded.role === "admin");

        if (decoded.role !== "admin") {
          router.push("/");
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!isLoggedIn || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-900"></div>
          <p className="mt-4 text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="bg-opacity-50 fixed z-40 bg-slate-800/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed z-30 h-full min-h-screen bg-blue-950 text-white shadow-lg transition-transform duration-300 ${
          isMobile
            ? `left-0 w-50 transform ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : `left-0 ${sidebarOpen ? "w-64" : "w-16"}`
        } `}
      >
        <div className="flex h-full flex-col p-4">
          <div className="mt-3 mb-8 flex items-center space-x-3 sm:justify-center">
            <button
              onClick={toggleSidebar}
              className="mr-4 rounded p-2 transition-colors hover:bg-gray-100 lg:hidden"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="hidden md:flex">
              <Image
                src="/images/logo/logorv-removebg-preview.png"
                alt=""
                width={150}
                height={150}
                className="h-12 w-12 rounded-lg object-contain"
              />
            </div>

            <h1
              className={`text-xl font-bold transition-opacity duration-300 ${
                sidebarOpen ? "opacity-100" : "w-0 opacity-0"
              }`}
            >
              {sidebarOpen && (
                <p className="flex text-center font-semibold md:text-2xl">
                  Admin Panel
                </p>
              )}
            </h1>

            {/* <button
              onClick={toggleSidebar}
              className="p-2 rounded hover:bg-blue-800 transition-colors flex-shrink-0"
            >
              {sidebarOpen ? "◀" : "▶"}
            </button> */}
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-all duration-200 ${
                  activePage === item.id
                    ? "border-l-4 border-blue-600 bg-slate-950/70 shadow-md"
                    : "hover:border-l-4 hover:border-blue-600 hover:bg-slate-950/50"
                }`}
              >
                {/* <span className="text-xl flex-shrink-0">{item.icon}</span> */}
                <span
                  className={`transition-opacity duration-300 sm:text-lg ${
                    sidebarOpen ? "opacity-100" : "w-0 opacity-0"
                  }`}
                >
                  {sidebarOpen && item.label}
                </span>
              </Link>
            ))}
            {sidebarOpen && (
              <div className="mt-auto">
                <Link href="/" className="cursor-pointer">
                  <button
                    // onClick={handleLogout}
                    className="w-full rounded-lg bg-blue-800 px-4 py-2 text-white transition-colors hover:bg-blue-900"
                  >
                    Home
                  </button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${!isMobile ? (sidebarOpen ? "ml-64" : "ml-16") : "ml-0"} `}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm md:hidden">
          <div className="flex items-center px-6 py-4">
            <button
              onClick={toggleSidebar}
              className="mr-4 rounded p-2 transition-colors hover:bg-gray-100 lg:hidden"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {sidebarOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            <div className="flex items-center gap-2">
              {/* <span className="text-xl">
                {menuItems.find((item) => item.id === activePage)?.icon || "📊"}
              </span> */}
              <h2 className="text-2xl font-semibold text-blue-900">
                {menuItems.find((item) => item.id === activePage)?.label ||
                  "Dashboard"}
              </h2>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main
          className={`z flex-1 overflow-y-auto p-6 transition-all duration-300 ${isMobile ? (sidebarOpen ? "blur-xs" : "") : ""} `}
        >
          {isMobile && sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 z-40"
            />
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
