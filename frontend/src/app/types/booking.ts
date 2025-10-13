export interface Doctor {
    id: number;
    name: string;
    specialization: string;
    Status?: SlotStatus;
    image_url: string;
    // for schedule
    service?: string
    duration?: number
    start? : string
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price_min: number;
  price_max: number;
  duration_minutes : number;
}
export interface ServiceContent {
    title: string;
    content : string;
    image_url:string;
}
export type SlotStatus = 'available' | 'fully_booked' | 'nearly_full' | 'pending' | 'booked' | 'blocked' | 'no_show' | 'closed' | 'passed';

export interface Slot {
    time: string;
    status: SlotStatus;
    doctors?: Doctor[];
    duration?: number;
}
export interface DayAvailability {
    date: string;
    slots: Slot[];
    status?: SlotStatus; // daystatus
}
export interface MonthAvailability {
    month: string; // YYYY/MM
    days: DayAvailability[];
}

