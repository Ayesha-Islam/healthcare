import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create test patients
  const testPatients = [
    {
      phoneNumber: "+923090767566",
      firstName: "Ahmad",
      lastName: "Ali",
      email: "ahmad@example.com",
      dateOfBirth: new Date("1990-01-01"),
      address: "123 Main St, New York, NY 10001",
      emergencyContact: "+92309076566",
      medicalHistory: JSON.stringify(["No significant history"]),
      allergies: JSON.stringify(["None"]),
      currentMedications: JSON.stringify([]),
      insuranceInfo: JSON.stringify({
        provider: "Blue Cross",
        policyNumber: "BC123456",
      }),
    },
    {
      phoneNumber: "+923078967545",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      dateOfBirth: new Date("1995-05-15"),
      address: "456 Oak Ave, Los Angeles, CA 90001",
      emergencyContact: "+923078967545",
      medicalHistory: JSON.stringify(["Hypertension", "Type 2 Diabetes"]),
      allergies: JSON.stringify(["Penicillin"]),
      currentMedications: JSON.stringify(["Metformin", "Lisinopril"]),
      insuranceInfo: JSON.stringify({
        provider: "Aetna",
        policyNumber: "AE789012",
      }),
    },
    {
      phoneNumber: "+923046545888",
      firstName: "Abeeha",
      lastName: "Arshad",
      email: "abeeha@example.com",
      dateOfBirth: new Date("1978-11-30"),
      address: "789 Pine Rd, Chicago, IL 60601",
      emergencyContact: "+923046545888",
      medicalHistory: JSON.stringify(["Asthma"]),
      allergies: JSON.stringify(["Dust", "Pollen"]),
      currentMedications: JSON.stringify(["Albuterol inhaler"]),
      insuranceInfo: JSON.stringify({
        provider: "UnitedHealthcare",
        policyNumber: "UH345678",
      }),
    },
  ];

  console.log("👤 Creating test patients...");
  for (const patientData of testPatients) {
    await prisma.patient.upsert({
      where: { phoneNumber: patientData.phoneNumber },
      update: {},
      create: patientData,
    });
  }

  // Create sample appointments
  console.log("📅 Creating sample appointments...");

  const patients = await prisma.patient.findMany();

  if (patients.length > 0) {
    const appointmentTypes = [
      { type: "GENERAL_CHECKUP", reason: "Annual physical examination", doctorName: "Dr. Sarah Johnson" },
      { type: "FOLLOW_UP", reason: "Follow-up for diabetes management", doctorName: "Dr. Michael Chen" },
      { type: "CONSULTATION", reason: "New patient consultation", doctorName: "Dr. Emily Rodriguez" },
      { type: "URGENT_CARE", reason: "Severe headache evaluation", doctorName: "Dr. David Williams" },
    ];

    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      const appointmentType = appointmentTypes[i % appointmentTypes.length];

      // Create a future appointment
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + (i + 1) * 7); // 1, 2, 3 weeks from now

      await prisma.appointment.upsert({
        where: {
          id: `appointment-${patient.id}-future`
        },
        update: {},
        create: {
          id: `appointment-${patient.id}-future`,
          patientId: patient.id,
          dateTime: futureDate,
          type: appointmentType.type,
          status: "SCHEDULED",
          reason: appointmentType.reason,
          doctorName: appointmentType.doctorName,
          symptoms: JSON.stringify(["General checkup"]),
          duration: 30,
          reminderSent: false,
          createdFrom: "PHONE",
        },
      });

      // Create a past appointment
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - (i + 1) * 30); // 1, 2, 3 months ago

      await prisma.appointment.upsert({
        where: {
          id: `appointment-${patient.id}-past`
        },
        update: {},
        create: {
          id: `appointment-${patient.id}-past`,
          patientId: patient.id,
          dateTime: pastDate,
          type: "GENERAL_CHECKUP",
          status: "COMPLETED",
          reason: "Routine checkup",
          doctorName: appointmentType.doctorName,
          symptoms: JSON.stringify([]),
          duration: 30,
          reminderSent: true,
          createdFrom: "ONLINE",
          notes: "Patient in good health. Recommended follow-up in 6 months.",
        },
      });
    }
  }

  // Create sample voice sessions
  console.log("📞 Creating sample voice sessions...");

  if (patients.length > 0) {
    const patient = patients[0];

    await prisma.voiceSession.upsert({
      where: { callSid: "CA_test_session_001" },
      update: {},
      create: {
        callSid: "CA_test_session_001",
        patientId: patient.id,
        phoneNumber: patient.phoneNumber,
        status: "COMPLETED",
        intent: "BOOK_APPOINTMENT",
        transcript: JSON.stringify([
          { role: "assistant", content: "Hello! How can I help you today?" },
          { role: "user", content: "I need to book an appointment" },
          { role: "assistant", content: "I'd be happy to help you book an appointment. What type of appointment do you need?" },
        ]),
        collectedInfo: JSON.stringify({
          appointmentType: "GENERAL_CHECKUP",
          preferredDate: new Date().toISOString(),
          symptoms: ["routine checkup"],
        }),
        duration: 180,
        startedAt: new Date(Date.now() - 180000),
        endedAt: new Date(),
      },
    });
  }

  console.log("✅ Database seeding completed successfully!");
  console.log(`   - Created ${testPatients.length} test patients`);
  console.log(`   - Created ${testPatients.length * 2} appointments (past and future)`);
  console.log(`   - Created 1 sample voice session`);
}

main()
  .catch((e) => {
    console.error("❌ Database seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });