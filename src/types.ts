export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo: string | null;
}

export interface RenterInfo {
  name: string;
  phone: string;
  identityId: string;
  address: string;
}

export interface CarInfo {
  model: string;
  plateNumber: string;
  color: string;
}

export interface RentalDetails {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  durationDays: number;
  pricePerDay: number;
  totalAmount: number;
  deposit: number;
  amountPaid: number;
  paymentMethod: string;
  notes: string;
  invoiceNumber: string;
}

export interface InvoiceData {
  business: BusinessInfo;
  renter: RenterInfo;
  car: CarInfo;
  rental: RentalDetails;
}
