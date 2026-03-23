import { db } from "@workspace/db";
import {
  labsTable,
  usersTable,
  bookingsTable,
  conflictsTable,
  auditLogTable,
} from "@workspace/db";
import { randomUUID } from "crypto";

async function seed() {
  console.log("Seeding PLMS data...");

  await db.delete(auditLogTable);
  await db.delete(conflictsTable);
  await db.delete(bookingsTable);
  await db.delete(labsTable);
  await db.delete(usersTable);

  const labs = [
    { id: "lab-101", name: "Lab 101", building: "Tech Block A", floor: 1, capacity: 60, hasI7Processors: true, hasGraphicsCards: false, isUnderMaintenance: false },
    { id: "lab-201", name: "Lab 201", building: "Tech Block B", floor: 2, capacity: 50, hasI7Processors: true, hasGraphicsCards: true, isUnderMaintenance: false },
    { id: "lab-202", name: "Lab 202", building: "Tech Block B", floor: 2, capacity: 45, hasI7Processors: false, hasGraphicsCards: false, isUnderMaintenance: false },
    { id: "lab-301", name: "Lab 301", building: "Tech Block C", floor: 3, capacity: 40, hasI7Processors: true, hasGraphicsCards: false, isUnderMaintenance: false },
    { id: "lab-102", name: "Lab 102", building: "Tech Block A", floor: 1, capacity: 55, hasI7Processors: false, hasGraphicsCards: true, isUnderMaintenance: false },
    { id: "lab-302", name: "Lab 302", building: "Tech Block C", floor: 3, capacity: 70, hasI7Processors: true, hasGraphicsCards: true, isUnderMaintenance: false },
  ];

  await db.insert(labsTable).values(labs);
  console.log("Labs seeded");

  const users = [
    { id: "user-admin", name: "Joh Doe", email: "admin@srmist.edu.in", password: "password", role: "Admin", department: "Administration" },
    { id: "user-faculty", name: "Dr. Mohan Das", email: "faculty@srmist.edu.in", password: "password", role: "Faculty", department: "CSE" },
    { id: "user-student", name: "Rahul Kumar", email: "student@srmist.edu.in", password: "password", role: "Student", department: "CSE", registrationNumber: "RA2111003010123" },
    { id: "user-coordinator", name: "Placement Office", email: "coordinator@srmist.edu.in", password: "password", role: "PlacementCoordinator", department: "Placement Cell" },
    { id: "user-assistant", name: "Lab Assistant", email: "assistant@srmist.edu.in", password: "password", role: "LabAssistant", department: "Technical" },
    { id: "user-faculty2", name: "Dr. Sunita Verma", email: "faculty2@srmist.edu.in", password: "password", role: "Faculty", department: "IT" },
    { id: "user-faculty3", name: "Dr. Priya Sharma", email: "faculty3@srmist.edu.in", password: "password", role: "Faculty", department: "ECE" },
  ];

  await db.insert(usersTable).values(users);
  console.log("Users seeded");

  const b1 = randomUUID();
  const b2 = randomUUID();
  const b3 = randomUUID();
  const b4 = randomUUID();
  const b5 = randomUUID();
  const b6 = randomUUID();
  const b7 = randomUUID();
  const b8 = randomUUID();
  const b9 = randomUUID();
  const b10 = randomUUID();
  const b11 = randomUUID();
  const b12 = randomUUID();
  const b_displaced1 = randomUUID();
  const b_displaced2 = randomUUID();

  const bookings = [
    { id: b1, subject: "Campus Placement Drive - TCS", faculty: "Placement Office", labId: "lab-101", labName: "Lab 101", day: "Monday", startTime: "09:00", endTime: "12:00", capacity: 60, priority: "P1", isDisplaced: false, requiresI7: true, requiresGraphics: false },
    { id: b2, subject: "Campus Placement Drive - Infosys", faculty: "Placement Office", labId: "lab-201", labName: "Lab 201", day: "Tuesday", startTime: "09:00", endTime: "11:00", capacity: 50, priority: "P1", isDisplaced: false, requiresI7: true, requiresGraphics: true },
    { id: b3, subject: "Mobile App Development", faculty: "Dr. Mohan Das", labId: "lab-302", labName: "Lab 302", day: "Friday", startTime: "09:00", endTime: "11:00", capacity: 60, priority: "P3", isDisplaced: false, requiresI7: false, requiresGraphics: false },
    { id: b4, subject: "Data Structures Lab", faculty: "Dr. Priya Sharma", labId: "lab-202", labName: "Lab 202", day: "Monday", startTime: "11:00", endTime: "13:00", capacity: 45, priority: "P2", isDisplaced: false, requiresI7: false, requiresGraphics: false },
    { id: b5, subject: "Machine Learning Lab", faculty: "Dr. Sunita Verma", labId: "lab-201", labName: "Lab 201", day: "Wednesday", startTime: "14:00", endTime: "16:00", capacity: 50, priority: "P3", isDisplaced: false, requiresI7: true, requiresGraphics: true },
    { id: b6, subject: "Database Management Lab Exam", faculty: "Dr. Priya Sharma", labId: "lab-301", labName: "Lab 301", day: "Thursday", startTime: "10:00", endTime: "12:00", capacity: 40, priority: "P2", isDisplaced: false, requiresI7: false, requiresGraphics: false },
    { id: b7, subject: "Campus Placement - Wipro", faculty: "Placement Office", labId: "lab-101", labName: "Lab 101", day: "Thursday", startTime: "09:00", endTime: "12:00", capacity: 60, priority: "P1", isDisplaced: false, requiresI7: true, requiresGraphics: false },
    { id: b8, subject: "Operating Systems Lab", faculty: "Dr. Mohan Das", labId: "lab-102", labName: "Lab 102", day: "Tuesday", startTime: "14:00", endTime: "16:00", capacity: 50, priority: "P3", isDisplaced: false, requiresI7: false, requiresGraphics: false },
    { id: b9, subject: "Network Security Lab", faculty: "Dr. Sunita Verma", labId: "lab-302", labName: "Lab 302", day: "Wednesday", startTime: "10:00", endTime: "12:00", capacity: 60, priority: "P3", isDisplaced: false, requiresI7: false, requiresGraphics: false },
    { id: b10, subject: "Web Technologies Lab", faculty: "Dr. Mohan Das", labId: "lab-202", labName: "Lab 202", day: "Friday", startTime: "13:00", endTime: "15:00", capacity: 40, priority: "P3", isDisplaced: false, requiresI7: false, requiresGraphics: false },
    { id: b11, subject: "Compiler Design Lab Exam", faculty: "Dr. Priya Sharma", labId: "lab-301", labName: "Lab 301", day: "Tuesday", startTime: "11:00", endTime: "13:00", capacity: 40, priority: "P2", isDisplaced: false, requiresI7: false, requiresGraphics: false },
    { id: b12, subject: "AI & Deep Learning Lab", faculty: "Dr. Sunita Verma", labId: "lab-201", labName: "Lab 201", day: "Friday", startTime: "14:00", endTime: "16:00", capacity: 50, priority: "P3", isDisplaced: false, requiresI7: true, requiresGraphics: true },
    { id: b_displaced1, subject: "CS101 - Introduction to Programming", faculty: "Dr. Mohan Das", labId: "lab-101", labName: "Lab 101", day: "Monday", startTime: "09:00", endTime: "11:00", capacity: 60, priority: "P3", isDisplaced: true, requiresI7: false, requiresGraphics: false },
    { id: b_displaced2, subject: "IT201 - Data Analytics Lab", faculty: "Dr. Sunita Verma", labId: "lab-201", labName: "Lab 201", day: "Tuesday", startTime: "09:00", endTime: "11:00", capacity: 50, priority: "P3", isDisplaced: true, requiresI7: false, requiresGraphics: false },
  ];

  await db.insert(bookingsTable).values(bookings);
  console.log("Bookings seeded");

  const c1 = randomUUID();
  const c2 = randomUUID();
  const c3 = randomUUID();

  const conflicts = [
    {
      id: c1,
      winningBookingId: b1,
      displacedBookingId: b_displaced1,
      resolution: "Higher priority booking (P1) automatically displaced lower priority booking (P3) at 10:05:12",
    },
    {
      id: c2,
      winningBookingId: b2,
      displacedBookingId: b_displaced2,
      resolution: "Higher priority booking (P1) automatically displaced lower priority booking (P3) at 08:30:15",
    },
  ];

  await db.insert(conflictsTable).values(conflicts);
  console.log("Conflicts seeded");

  await db.insert(auditLogTable).values([
    {
      id: randomUUID(),
      action: "Automatic Priority Override",
      description: "Displaced by P1 Placement Drive (Wipro) in Lab 101",
      actor: "System",
      subject: "CSE301 - Compiler Design Lab",
      priority: "P1",
      labName: "Lab 101",
      actionType: "system",
    },
    {
      id: randomUUID(),
      action: "Manual Booking Modification",
      description: "Changed time from 09:00-11:00 to 10:00-12:00",
      actor: "Dr. Priya Sharma (Faculty)",
      subject: "Data Structures Lab Exam",
      priority: "P2",
      labName: "Lab 202",
      actionType: "manual",
    },
    {
      id: randomUUID(),
      action: "Automatic Priority Override",
      description: "Displaced by P1 Placement Drive (Infosys) in Lab 201",
      actor: "System",
      subject: "IT201 - Data Analytics Lab",
      priority: "P1",
      labName: "Lab 201",
      actionType: "system",
    },
    {
      id: randomUUID(),
      action: "Lab Capacity Update",
      description: "Updated capacity from 55 to 60 seats",
      actor: "Admin (Placement Office)",
      subject: "Lab 202",
      priority: "P3",
      labName: "Lab 202",
      actionType: "manual",
    },
    {
      id: randomUUID(),
      action: "Automatic Priority Override",
      description: "Displaced by P1 Placement Drive (TCS) in Lab 101",
      actor: "System",
      subject: "CS101 - Introduction to Programming",
      priority: "P1",
      labName: "Lab 101",
      actionType: "system",
    },
    {
      id: randomUUID(),
      action: "New Booking Created",
      description: "Regular class scheduled successfully",
      actor: "Dr. Mohan Das (Faculty)",
      subject: "Mobile App Development",
      priority: "P3",
      labName: "Lab 302",
      actionType: "manual",
    },
  ]);
  console.log("Audit logs seeded");

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
