import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function setupDatabase(): Promise<void> {
    console.log('🗄️  Setting up database...');

    try {
        // Ensure data directory exists
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            console.log('✅ Created data directory');
        }

        await prisma.$connect();
        console.log('✅ Database connection successful');

        await seedInitialData();
        console.log('✅ Database setup complete');
    } catch (error: any) {
        console.error('❌ Database setup failed:', error.message);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

async function seedInitialData(): Promise<void> {
    console.log('📝 Seeding initial data...');

    // Check if we already have patients
    const patientCount = await prisma.patient.count();

    if (patientCount === 0) {
        // Create a test patient
        await prisma.patient.create({
            data: {
                phoneNumber: '03001234556',
                firstName: 'Ali',
                lastName: 'Ahmad',
                dateOfBirth: new Date('1990-01-01'),
                email: 'ali.ahmad@example.com',
                medicalHistory: JSON.stringify(['Hypertension']),
                allergies: JSON.stringify(['Penicillin'])
            }
        });
        console.log('✅ Created test patient');
    } else {
        console.log('ℹ️  Patients already exist, skipping seed');
    }
}

setupDatabase()
    .then(() => {
        console.log('✅ Setup completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    });
