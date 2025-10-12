import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { logger } from '../config/logger';

export interface AuthConfig {
    jwtSecret: string;
    jwtExpiration: string;
    refreshTokenExpiration: string;
}

export interface UserPayload {
    userId: string;
    email: string;
    role: 'admin' | 'doctor' | 'staff' | 'patient';
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export class AuthService {
    private jwtSecret: Secret;
    private jwtExpiration: string;
    private refreshTokenExpiration: string;

    constructor(config?: Partial<AuthConfig>) {
        this.jwtSecret = config?.jwtSecret || process.env.JWT_SECRET || 'default-secret-change-in-production';
        this.jwtExpiration = config?.jwtExpiration || '1h';
        this.refreshTokenExpiration = config?.refreshTokenExpiration || '7d';
    }

    private signToken(payload: object, expiresIn: string): string {
        const options: SignOptions = {
            expiresIn: expiresIn as SignOptions['expiresIn']
        };
        return jwt.sign(payload, this.jwtSecret, options);
    }

    private verifyToken<T>(token: string): T {
        return jwt.verify(token, this.jwtSecret) as T;
    }

    generateTokens(payload: UserPayload): TokenPair {
        const accessToken = this.signToken(payload, this.jwtExpiration);
        const refreshToken = this.signToken(
            { userId: payload.userId, type: 'refresh' },
            this.refreshTokenExpiration
        );
        return { accessToken, refreshToken };
    }

    verifyAccessToken(token: string): UserPayload {
        try {
            return this.verifyToken<UserPayload>(token);
        } catch (error) {
            logger.error('Token verification failed:', error);
            throw new Error('Invalid or expired token');
        }
    }

    verifyRefreshToken(token: string): { userId: string; type: string; } {
        try {
            const decoded = this.verifyToken<{ userId: string; type: string; }>(token);
            if (decoded.type !== 'refresh') {
                throw new Error('Invalid token type');
            }
            return decoded;
        } catch (error) {
            logger.error('Refresh token verification failed:', error);
            throw new Error('Invalid or expired refresh token');
        }
    }

    refreshAccessToken(refreshToken: string, userPayload: Omit<UserPayload, 'userId'>): TokenPair {
        const decoded = this.verifyRefreshToken(refreshToken);
        return this.generateTokens({
            userId: decoded.userId,
            ...userPayload
        });
    }

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    generateApiKey(): string {
        return randomBytes(32).toString('hex');
    }

    isValidApiKey(apiKey: string): boolean {
        return /^[a-f0-9]{64}$/.test(apiKey);
    }

    extractTokenFromHeader(authHeader: string | null): string | null {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7);
    }

    generatePasswordResetToken(userId: string): string {
        return this.signToken(
            { userId, type: 'password_reset' },
            '1h'
        );
    }

    verifyPasswordResetToken(token: string): { userId: string; type: string; } {
        try {
            const decoded = this.verifyToken<{ userId: string; type: string; }>(token);
            if (decoded.type !== 'password_reset') {
                throw new Error('Invalid token type');
            }
            return decoded;
        } catch (error) {
            logger.error('Password reset token verification failed:', error);
            throw new Error('Invalid or expired password reset token');
        }
    }
}
