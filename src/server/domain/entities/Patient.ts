export interface Patient {
    id: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    email?: string;
    address?: string;
    emergencyContact?: string;
    medicalHistory?: string[];
    allergies?: string[];
    currentMedications?: string[];
    insuranceInfo?: {
        provider: string;
        policyNumber: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface CreatePatientDTO {
    phoneNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    email?: string;
    address?: string;
    emergencyContact?: string;
}

export interface UpdatePatientDTO {
    firstName?: string;
    lastName?: string;
    email?: string;
    address?: string;
    emergencyContact?: string;
    medicalHistory?: string[];
    allergies?: string[];
    currentMedications?: string[];
    insuranceInfo?: {
        provider: string;
        policyNumber: string;
    };
}