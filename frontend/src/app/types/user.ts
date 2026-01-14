export interface ProfileData {
  name: string;
  phone: string;
  age?: number;
  email: string;
  role: string;
  chronic_disease?: string;
  line_user_id?: string | null;
  line_display_name?: string | null;
  line_picture_url?: string | null;
}
export interface ProfileAppointment {
  id: number;
  doctor_name: string;
  service_name: string;
  time_range: string; // "08:00-10:00"
  is_past: "current" | "past";
  status: string;
  note?: string;
  image_url?: string;
  date: string;
}