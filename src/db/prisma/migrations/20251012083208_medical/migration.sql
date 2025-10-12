-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "emergencyContact" TEXT,
    "medicalHistory" TEXT,
    "allergies" TEXT,
    "currentMedications" TEXT,
    "insuranceInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_symptoms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "urgency" INTEGER NOT NULL,
    "specialty" TEXT NOT NULL,
    "keywords" TEXT[],
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_symptoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "reason" TEXT NOT NULL,
    "symptoms" TEXT,
    "notes" TEXT,
    "doctorName" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 30,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdFrom" TEXT NOT NULL DEFAULT 'ONLINE',
    "voiceSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_sessions" (
    "id" TEXT NOT NULL,
    "callSid" TEXT NOT NULL,
    "patientId" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "intent" TEXT,
    "transcript" TEXT,
    "collectedInfo" TEXT,
    "appointmentId" TEXT,
    "transferred" BOOLEAN NOT NULL DEFAULT false,
    "transferReason" TEXT,
    "duration" INTEGER,
    "recordingUrl" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voice_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_recordings" (
    "id" TEXT NOT NULL,
    "voiceSessionId" TEXT NOT NULL,
    "callSid" TEXT NOT NULL,
    "recordingUrl" TEXT NOT NULL,
    "recordingSid" TEXT,
    "localPath" TEXT,
    "duration" INTEGER NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'mp3',
    "transcription" TEXT,
    "transcriptionStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "qualityScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_recordings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_phoneNumber_key" ON "patients"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_email_key" ON "doctors"("email");

-- CreateIndex
CREATE INDEX "doctors_specialty_idx" ON "doctors"("specialty");

-- CreateIndex
CREATE INDEX "doctors_isAvailable_idx" ON "doctors"("isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "medical_symptoms_name_key" ON "medical_symptoms"("name");

-- CreateIndex
CREATE INDEX "medical_symptoms_category_idx" ON "medical_symptoms"("category");

-- CreateIndex
CREATE INDEX "medical_symptoms_specialty_idx" ON "medical_symptoms"("specialty");

-- CreateIndex
CREATE INDEX "medical_symptoms_urgency_idx" ON "medical_symptoms"("urgency");

-- CreateIndex
CREATE INDEX "appointments_patientId_idx" ON "appointments"("patientId");

-- CreateIndex
CREATE INDEX "appointments_doctorId_idx" ON "appointments"("doctorId");

-- CreateIndex
CREATE INDEX "appointments_dateTime_idx" ON "appointments"("dateTime");

-- CreateIndex
CREATE INDEX "appointments_status_idx" ON "appointments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "voice_sessions_callSid_key" ON "voice_sessions"("callSid");

-- CreateIndex
CREATE INDEX "voice_sessions_callSid_idx" ON "voice_sessions"("callSid");

-- CreateIndex
CREATE INDEX "voice_sessions_patientId_idx" ON "voice_sessions"("patientId");

-- CreateIndex
CREATE INDEX "voice_sessions_status_idx" ON "voice_sessions"("status");

-- CreateIndex
CREATE INDEX "call_recordings_voiceSessionId_idx" ON "call_recordings"("voiceSessionId");

-- CreateIndex
CREATE INDEX "call_recordings_callSid_idx" ON "call_recordings"("callSid");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_sessions" ADD CONSTRAINT "voice_sessions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_recordings" ADD CONSTRAINT "call_recordings_voiceSessionId_fkey" FOREIGN KEY ("voiceSessionId") REFERENCES "voice_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
