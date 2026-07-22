export type Role = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'PATIENT';

export type AppointmentStatus =
  | 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED' | 'CANCELLED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type BloodGroup =
  | 'A_POSITIVE' | 'A_NEGATIVE' | 'B_POSITIVE' | 'B_NEGATIVE'
  | 'AB_POSITIVE' | 'AB_NEGATIVE' | 'O_POSITIVE' | 'O_NEGATIVE';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  patient?: PatientProfile;
  doctor?: DoctorProfile;
}

export interface PatientProfile {
  id: string;
  userId: string;
  dateOfBirth?: string;
  gender?: Gender;
  bloodGroup?: BloodGroup;
  address?: string;
  allergies?: string;
  medicalHistory?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRel?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  departmentId: string;
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  licenseNumber: string;
  availableDays: string;
  startTime: string;
  endTime: string;
  bio?: string;
  department: Department;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  duration: number;
  status: AppointmentStatus;
  type: string;
  reason?: string;
  notes?: string;
  fee: number;
  createdAt: string;
  patient: { user: User };
  doctor: { user: User; department: Department; specialization: string };
  prescription?: Prescription;
  bill?: Bill;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  symptoms?: string;
  notes?: string;
  followUpDate?: string;
  createdAt: string;
  medications: PrescriptionItem[];
  patient: { user: User };
  doctor: { user: User };
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Bill {
  id: string;
  appointmentId: string;
  patientId: string;
  billNumber: string;
  consultFee: number;
  medicinesFee: number;
  labFee: number;
  otherFee: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  paymentMethod?: string;
  notes?: string;
  paidAt?: string;
  createdAt: string;
  patient: { user: User };
  appointment: Appointment;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
