"use client";
import { useState, useEffect } from "react";
import api from "@/app/lib/api";
import Swal from "sweetalert2";
import Image from "next/image";
import { ServiceWithContent } from "@/app/types/booking";
import { Pencil, Trash } from "lucide-react";

export default function ServicesManagement() {
  const [servicesWithContent, setServicesWithContent] = useState<
    ServiceWithContent[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] =
    useState<ServiceWithContent | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Form states
  const [serviceForm, setServiceForm] = useState({
    name: "",
    short_description: "",
    price_min: "",
    price_max: "",
    duration_minutes: "",
    title: "no",
    content: "",
  });

  useEffect(() => {
    fetchServicesWithContent();
    console.log(servicesWithContent);
  }, []);

  const fetchServicesWithContent = async () => {
    try {
      const res = await api.get("/services-with-content");
      setServicesWithContent(res.data);
    } catch (error) {
      console.error("Error fetching services:", error);
      Swal.fire("ผิดพลาด", "ไม่สามารถโหลดข้อมูลบริการได้", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that minimum price is not greater than maximum price
    const priceMin = parseFloat(serviceForm.price_min);
    const priceMax = parseFloat(serviceForm.price_max);

    if (priceMin > priceMax) {
      Swal.fire("ผิดพลาด", "ราคาต่ำสุดไม่สามารถมากกว่าราคาสูงสุดได้", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", serviceForm.name);
      formData.append("short_description", serviceForm.short_description);
      formData.append("price_min", serviceForm.price_min);
      formData.append("price_max", serviceForm.price_max);
      formData.append("duration_minutes", serviceForm.duration_minutes);
      formData.append("title", serviceForm.title);
      formData.append("content", serviceForm.content);

      if (imageFile) {
        formData.append("file", imageFile);
      }
      console.log("w", serviceForm);
      if (editingService) {
        await api.put(`/services-content/${editingService.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("สำเร็จ", "อัปเดตบริการสำเร็จ", "success");
      } else {
        await api.post("/services-content", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("สำเร็จ", "เพิ่มบริการสำเร็จ", "success");
      }

      resetServiceForm();
      fetchServicesWithContent();
    } catch (error) {
      console.error("Error saving service:", error);
      Swal.fire("ผิดพลาด", "ไม่สามารถบันทึกบริการได้", "error");
    }
  };

  const handleDeleteService = async (id: number) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณต้องการลบบริการนี้ใช่หรือไม่",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        await api.post(`/services/${id}/delete`, {});
        Swal.fire("สำเร็จ", "ลบบริการสำเร็จ", "success");
        fetchServicesWithContent();
      } catch (error) {
        console.error("Error deleting service:", error);
        Swal.fire("ผิดพลาด", "ไม่สามารถลบบริการได้", "error");
      }
    }
  };

  const editService = (service: ServiceWithContent) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      short_description: service.short_description,
      price_min: service.price_min.toString(),
      price_max: service.price_max.toString(),
      duration_minutes: service.duration_minutes.toString(),
      title: service.title,
      content: service.content,
    });
    setShowServiceForm(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancelNewImage = () => {
    setImageFile(null);
    setPreviewUrl("");
  };

  const resetServiceForm = () => {
    setServiceForm({
      name: "",
      short_description: "",
      price_min: "",
      price_max: "",
      duration_minutes: "",
      title: "",
      content: "",
    });
    setImageFile(null);
    setPreviewUrl("");
    setEditingService(null);
    setShowServiceForm(false);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + " ฿";
  };

  // Close modal when clicking outside
  const handleModalBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      resetServiceForm();
    }
  };

  if (loading) {
    return <div className="text-center py-8">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Services Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-blue-900">จัดการบริการ</h3>
          <button
            onClick={() => setShowServiceForm(true)}
            className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900"
          >
            + เพิ่มบริการ
          </button>
        </div>

        {/* Card View - Responsive Design */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {servicesWithContent.map((service) => (
            <div
              key={service.id}
              className="flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image Section */}
              {service.image_url &&
              service.image_url !== "" &&
              service.image_url.includes("/images/services-pic") ? (
                <div className="relative w-full h-48 md:h-56 lg:h-64">
                  <Image
                    src={service.image_url}
                    alt={service.title}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="relative w-full h-48 md:h-56 lg:h-64">
                  <Image
                    src={"/images/services-pic/no_image_available.jpg"}
                    alt={service.title}
                    fill
                    className="object-contain"
                  />
                </div>
              )}

              {/* Content Section */}
              <div className="p-4 md:p-5 flex flex-col flex-grow">
                <h4 className="text-blue-900 font-bold text-lg md:text-xl mb-2 text-center flex-grow">
                  {service.name}
                </h4>
                <p className=" text-gray-600 text-sm md:text-base mb-4 flex-grow">
                  {service.short_description}
                </p>

                {/* Service Details */}
                <div className="space-y-2 mb-4 text-xs sm:text-sm xl:text-base">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">ราคา:</span>
                    <span className="text-green-600 font-semibold ">
                      {formatPrice(service.price_min)} -{" "}
                      {formatPrice(service.price_max)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">ระยะเวลา:</span>
                    <span className="text-gray-900">
                      {service.duration_minutes} นาที
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => editService(service)}
                    className="flex items-center justify-center flex-1 bg-amber-500 text-white p-2 rounded hover:bg-yellow-600 transition-colors text-sm md:text-base"
                  >
                    <Pencil/>
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="flex items-center justify-center flex-1 bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors text-sm md:text-base"
                  >
                    <Trash/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service Form Modal */}
      {showServiceForm && (
        <div
          className="fixed inset-0 bg-slate-800/50 bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleModalBackdropClick}
        >
          <form
            className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            id="serviceForm"
            onSubmit={handleServiceSubmit}
          >
            <div className="p-4 md:p-6 border-b border-b-slate-300">
              <h3 className="text-xl font-semibold">
                {editingService ? "แก้ไขบริการ" : "เพิ่มบริการใหม่"}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ชื่อบริการ
                    </label>
                    <input
                      type="text"
                      required
                      value={serviceForm.name}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, name: e.target.value })
                      }
                      className="w-full p-2 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      รูปภาพบริการ
                    </label>

                    {/* Preview รูปภาพ */}
                    <div className="mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* รูปเดิม (ถ้าแก้ไข) */}
                        {editingService?.image_url && (
                          <div>
                            <label className="block text-sm font-medium text-gray-600 mb-3">
                              รูปปัจจุบัน
                            </label>
                            <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50  p-3 py-5 hover:bg-gray-100">
                              {/* <div className="relative w-full h-48">
                                <Image
                                  src={editingService.image_url}
                                  alt="Current service"
                                  fill
                                  className="object-contain"
                                />
                              </div> */}
                              {editingService.image_url &&
                              editingService.image_url !== "" &&
                              editingService.image_url.includes(
                                "/images/services-pic"
                              ) ? (
                                <div className="relative w-full h-48">
                                  <Image
                                    src={editingService.image_url}
                                    alt={editingService.title}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="relative w-full h-48 ">
                                  <Image
                                    src={
                                      "/images/services-pic/no_image_available.jpg"
                                    }
                                    alt={editingService.title}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* รูปใหม่ (preview) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-3">
                            {editingService ? "รูปใหม่" : "รูปบริการ"}
                          </label>
                          <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-3 py-5 hover:bg-gray-100">
                            {previewUrl ? (
                              <div className="relative w-full h-48">
                                <Image
                                  src={previewUrl}
                                  alt="New service image"
                                  fill
                                  className="object-contain"
                                />
                                <button
                                  type="button"
                                  onClick={handleCancelNewImage}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transition-colors"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <div className="relative w-full h-48">
                                {/* Upload Button Inside Preview Area */}
                                <input
                                  id="image-upload"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileSelect}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="image-upload"
                                  className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                                >
                                  <svg
                                    className="w-12 h-12 text-gray-400 mb-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                  </svg>
                                  <span className="text-sm text-gray-600 font-medium mb-1">
                                    Choose Image
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Click to upload
                                  </span>
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      รายละเอียดย่อ
                    </label>
                    <textarea
                      required
                      value={serviceForm.short_description}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          short_description: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      เนื้อหาบริการ
                    </label>
                    <textarea
                      required
                      value={serviceForm.content}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          content: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        ราคาต่ำสุด
                      </label>
                      <input
                        type="number"
                        required
                        value={serviceForm.price_min}
                        onChange={(e) =>
                          setServiceForm({
                            ...serviceForm,
                            price_min: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-slate-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        ราคาสูงสุด
                      </label>
                      <input
                        type="number"
                        required
                        value={serviceForm.price_max}
                        onChange={(e) =>
                          setServiceForm({
                            ...serviceForm,
                            price_max: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-slate-300 rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ระยะเวลา (นาที)
                    </label>
                    <input
                      type="number"
                      required
                      value={serviceForm.duration_minutes}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          duration_minutes: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-t-slate-300 bg-gray-50">
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={resetServiceForm}
                  className="bg-slate-200 hover:bg-slate-300 px-4 py-2 border border-slate-300 rounded"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900"
                >
                  {editingService ? "อัปเดต" : "เพิ่ม"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
