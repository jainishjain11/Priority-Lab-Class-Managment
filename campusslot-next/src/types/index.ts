// src/types/index.ts
// Shared TypeScript interfaces for CampusSlot PLMS

export type UserRole =
  | "Admin"
  | "Faculty"
  | "PlacementCoordinator"
  | "LabAssistant"
  | "Student";

export type Priority = "P1" | "P2" | "P3";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  registrationNumber?: string | null;
}

export interface Lab {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  hasI7Processors: boolean;
  hasGraphicsCards: boolean;
  isUnderMaintenance: boolean;
  createdAt: string;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Booking {
  id: string;
  subject: string;
  faculty: string;
  labId: string;
  labName: string;
  timeSlot: TimeSlot;
  capacity: number;
  priority: Priority;
  isDisplaced: boolean;
  requiresI7: boolean;
  requiresGraphics: boolean;
  createdAt: string;
}

export interface Alert {
  id: string;
  bookingId: string;
  faculty: string;
  subject: string;
  originalLab: string;
  originalDay: string;
  originalStartTime: string;
  originalEndTime: string;
  reason: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  description: string;
  actor: string;
  subject: string;
  priority: string;
  labName: string | null;
  actionType: string;
  createdAt: string;
}

export interface ConflictRecord {
  id: string;
  winningBookingId: string;
  displacedBookingId: string;
  resolution: string;
  resolvedAt: string;
  winningBooking: Booking;
  displacedBooking: Booking;
}

export interface DashboardStats {
  totalLabs: number;
  totalCapacity: number;
  occupancyPercent: number;
  labsInUse: number;
  pendingConflicts: number;
  autoResolved: number;
  availableNow: number;
}

export interface AnalyticsOverview {
  totalBookings: number;
  p1Count: number;
  p2Count: number;
  p3Count: number;
  totalDisplacements: number;
  peakHours: { hour: string; count: number }[];
}

export interface LabUtilization {
  labName: string;
  utilizationPercent: number;
  bookingCount: number;
}

export interface SlotSuggestion {
  lab: Lab;
  timeSlot: TimeSlot;
  score: number;
  reason: string;
}

export interface BookingInput {
  subject: string;
  faculty: string;
  labId: string;
  timeSlot: TimeSlot;
  capacity: number;
  priority: Priority;
  requiresI7?: boolean;
  requiresGraphics?: boolean;
}

export interface ApiResponse<T> {
  data: T | null;
  error: { code: string; message: string } | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  registrationNumber?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  department: string;
}

// Role-based access control
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  Admin: ["dashboard", "schedule", "conflicts", "analytics", "audit", "labs", "alerts"],
  PlacementCoordinator: ["dashboard", "schedule", "conflicts", "analytics"],
  Faculty: ["dashboard", "schedule", "alerts"],
  LabAssistant: ["dashboard", "schedule", "audit", "labs"],
  Student: ["dashboard", "schedule"],
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  P1: "red",
  P2: "amber",
  P3: "emerald",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  P1: "P1 — Placement Drive",
  P2: "P2 — Lab Exam",
  P3: "P3 — Regular Class",
};

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
export const TIME_SLOTS = [
  { startTime: "09:00", endTime: "10:00" },
  { startTime: "10:00", endTime: "11:00" },
  { startTime: "11:00", endTime: "12:00" },
  { startTime: "12:00", endTime: "13:00" },
  { startTime: "13:00", endTime: "14:00" },
  { startTime: "14:00", endTime: "15:00" },
  { startTime: "15:00", endTime: "16:00" },
  { startTime: "16:00", endTime: "17:00" },
] as const;
