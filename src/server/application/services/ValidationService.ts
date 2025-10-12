import { ValidationError } from '../../domain/types/Errors';

export class ValidationService {
  static validatePhoneNumber(phone: string): void {
    const cleaned = phone.replace(/\D/g, '');

    const isValid = (
      (cleaned.length === 12 && cleaned.startsWith('92')) ||
      (cleaned.length === 11 && cleaned.startsWith('03')) ||
      (cleaned.length === 10 && cleaned.startsWith('3'))
    );

    if (!isValid) {
      throw new ValidationError('Invalid phone number format');
    }
  }

  static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }
  }

  static validateDateOfBirth(dob: Date): void {
    const age = this.calculateAge(dob);
    if (age < 0 || age > 150) {
      throw new ValidationError('Invalid date of birth');
    }
  }

  static validateAppointmentDate(date: Date): void {
    const now = new Date();
    if (date < now) {
      throw new ValidationError('Appointment date must be in the future');
    }

    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6);
    if (date > maxDate) {
      throw new ValidationError('Appointment date cannot be more than 6 months in the future');
    }
  }

  static validateRequired<T>(value: T, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw new ValidationError(`${fieldName} is required`);
    }
  }

  static validateStringLength(value: string, fieldName: string, min: number, max: number): void {
    if (value.length < min || value.length > max) {
      throw new ValidationError(
        `${fieldName} must be between ${min} and ${max} characters`
      );
    }
  }

  private static calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  static validateCallSid(callSid: string): void {
    if (!callSid.startsWith('CA')) {
      throw new ValidationError('Invalid Twilio Call SID');
    }
  }
}