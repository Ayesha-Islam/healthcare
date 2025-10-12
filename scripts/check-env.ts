import 'dotenv/config';

console.log('🔍 Environment Check:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

// Test the database connection
import { getPrismaClient } from '../src/server/infrastructure/config/database';

async function testConnection() {
    try {
        const prisma = getPrismaClient();
        // Test a simple query
        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Database connection test passed');
    } catch (error) {
        console.error('❌ Database connection test failed:', error);
    }
}

testConnection();