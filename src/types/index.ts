export interface Room {
  id: string;
  name: string;
}

export interface Reservation {
  id: string;
  roomId: string;
  startDate: string; // ISO yyyy-MM-dd
  endDate: string; // ISO yyyy-MM-dd
  guestName: string;
  bookingType: string;
  contacts: string;
  adultsChildren: string;
  touristTax: number;
  breakfast: boolean;
  specialRequests: string;
  pets: boolean;
  extraExpenses: number;
  pricePerNight: number;
  deposit: number;
  totalStay: number;
}
