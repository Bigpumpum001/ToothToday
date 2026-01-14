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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex h-full">
      {/* Mobile Menu Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed bg-slate-800/50 bg-opacity-50 z-40  "
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
    bg-blue-950 text-white shadow-lg transition-transform duration-300 fixed min-h-screen h-full z-30
    ${
      isMobile
        ? `left-0 w-50 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`
        : `left-0 ${sidebarOpen ? "w-64" : "w-16"}`
    }
  `}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center sm:justify-center space-x-3 mb-8 mt-3">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded hover:bg-gray-100 transition-colors mr-4"
            >
              <svg
                className="w-6 h-6"
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
                className="w-12 h-12 object-contain rounded-lg "
              />
            </div>

            <h1
              className={`font-bold text-xl transition-opacity duration-300 ${
                sidebarOpen ? "opacity-100" : "opacity-0 w-0"
              }`}
            >
              {sidebarOpen && (
                <p className="text-center md:text-2xl font-semibold flex">
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

          <nav className="space-y-2 flex-1 ">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activePage === item.id
                    ? "bg-slate-950/70 shadow-md border-l-4 border-blue-600"
                    : "hover:bg-slate-950/50 hover:border-l-4 hover:border-blue-600"
                }`}
              >
                {/* <span className="text-xl flex-shrink-0">{item.icon}</span> */}
                <span
                  className={`transition-opacity duration-300 sm:text-lg ${
                    sidebarOpen ? "opacity-100" : "opacity-0 w-0"
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
                    className="w-full bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg transition-colors"
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
        className={`
    flex-1 flex flex-col transition-all duration-300
    ${!isMobile ? (sidebarOpen ? "ml-64" : "ml-16") : "ml-0"}
  `}
      >
        {/* Top Bar */}
        <header className="bg-white md:hidden shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="px-6 py-4 flex items-center">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded hover:bg-gray-100 transition-colors mr-4"
            >
              <svg
                className="w-6 h-6"
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
          className={`flex-1 p-6 overflow-y-auto transition-all duration-300 z
          ${isMobile ? (sidebarOpen ? "blur-xs " : "") : ""}
          `}
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
