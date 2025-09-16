import { buyerSchema } from '../lib/validations/buyer';
import { z } from 'zod';

describe('Buyer Validation', () => {
  describe('Budget validation', () => {
    it('should pass when budgetMax is greater than budgetMin', () => {
      const validData = {
        fullName: 'John Doe',
        phone: '1234567890',
        city: 'CHANDIGARH' as const,
        propertyType: 'APARTMENT' as const,
        bhk: 'BHK2' as const,
        purpose: 'BUY' as const,
        budgetMin: 1000000,
        budgetMax: 1500000,
        timeline: 'MONTHS_3' as const,
        source: 'WEBSITE' as const,
      };

      expect(() => buyerSchema.parse(validData)).not.toThrow();
    });

    it('should pass when budgetMax equals budgetMin', () => {
      const validData = {
        fullName: 'John Doe',
        phone: '1234567890',
        city: 'CHANDIGARH' as const,
        propertyType: 'APARTMENT' as const,
        bhk: 'BHK2' as const,
        purpose: 'BUY' as const,
        budgetMin: 1000000,
        budgetMax: 1000000,
        timeline: 'MONTHS_3' as const,
        source: 'WEBSITE' as const,
      };

      expect(() => buyerSchema.parse(validData)).not.toThrow();
    });

    it('should fail when budgetMax is less than budgetMin', () => {
      const invalidData = {
        fullName: 'John Doe',
        phone: '1234567890',
        city: 'CHANDIGARH' as const,
        propertyType: 'APARTMENT' as const,
        bhk: 'BHK2' as const,
        purpose: 'BUY' as const,
        budgetMin: 1500000,
        budgetMax: 1000000,
        timeline: 'MONTHS_3' as const,
        source: 'WEBSITE' as const,
      };

      expect(() => buyerSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('should pass when only budgetMin is provided', () => {
      const validData = {
        fullName: 'John Doe',
        phone: '1234567890',
        city: 'CHANDIGARH' as const,
        propertyType: 'APARTMENT' as const,
        bhk: 'BHK2' as const,
        purpose: 'BUY' as const,
        budgetMin: 1000000,
        timeline: 'MONTHS_3' as const,
        source: 'WEBSITE' as const,
      };

      expect(() => buyerSchema.parse(validData)).not.toThrow();
    });

    it('should pass when only budgetMax is provided', () => {
      const validData = {
        fullName: 'John Doe',
        phone: '1234567890',
        city: 'CHANDIGARH' as const,
        propertyType: 'APARTMENT' as const,
        bhk: 'BHK2' as const,
        purpose: 'BUY' as const,
        budgetMax: 1500000,
        timeline: 'MONTHS_3' as const,
        source: 'WEBSITE' as const,
      };

      expect(() => buyerSchema.parse(validData)).not.toThrow();
    });
  });

  describe('BHK conditional validation', () => {
    it('should require BHK for APARTMENT property type', () => {
      const invalidData = {
        fullName: 'John Doe',
        phone: '1234567890',
        city: 'CHANDIGARH' as const,
        propertyType: 'APARTMENT' as const,
        purpose: 'BUY' as const,
        timeline: 'MONTHS_3' as const,
        source: 'WEBSITE' as const,
      };

      expect(() => buyerSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('should require BHK for VILLA property type', () => {
      const invalidData = {
        fullName: 'John Doe',
        phone: '1234567890',
        city: 'CHANDIGARH' as const,
        propertyType: 'VILLA' as const,
        purpose: 'BUY' as const,
        timeline: 'MONTHS_3' as const,
        source: 'WEBSITE' as const,
      };

      expect(() => buyerSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('should not require BHK for PLOT property type', () => {
      const validData = {
        fullName: 'John Doe',
        phone: '1234567890',
        city: 'CHANDIGARH' as const,
        propertyType: 'PLOT' as const,
        purpose: 'BUY' as const,
        timeline: 'MONTHS_3' as const,
        source: 'WEBSITE' as const,
      };

      expect(() => buyerSchema.parse(validData)).not.toThrow();
    });

    it('should not require BHK for OFFICE property type', () => {
      const validData = {
        fullName: 'John Doe',
        phone: '1234567890',
        city: 'CHANDIGARH' as const,
        propertyType: 'OFFICE' as const,
        purpose: 'BUY' as const,
        timeline: 'MONTHS_3' as const,
        source: 'WEBSITE' as const,
      };

      expect(() => buyerSchema.parse(validData)).not.toThrow();
    });
  });

  describe('Phone number validation', () => {
    it('should pass for valid phone numbers', () => {
      const validPhones = ['1234567890', '12345678901', '123456789012345'];
      
      validPhones.forEach(phone => {
        const validData = {
          fullName: 'John Doe',
          phone,
          city: 'CHANDIGARH' as const,
          propertyType: 'PLOT' as const,
          purpose: 'BUY' as const,
          timeline: 'MONTHS_3' as const,
          source: 'WEBSITE' as const,
        };

        expect(() => buyerSchema.parse(validData)).not.toThrow();
      });
    });

    it('should fail for invalid phone numbers', () => {
      const invalidPhones = ['123', '12345678901234567', 'abcdefghij', '123-456-7890'];
      
      invalidPhones.forEach(phone => {
        const invalidData = {
          fullName: 'John Doe',
          phone,
          city: 'CHANDIGARH' as const,
          propertyType: 'PLOT' as const,
          purpose: 'BUY' as const,
          timeline: 'MONTHS_3' as const,
          source: 'WEBSITE' as const,
        };

        expect(() => buyerSchema.parse(invalidData)).toThrow(z.ZodError);
      });
    });
  });
});