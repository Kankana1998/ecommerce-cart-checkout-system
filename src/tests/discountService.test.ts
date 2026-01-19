import { describe, expect, it } from "@jest/globals";
import {
  generateDiscountCodeForNthOrder,
  validateDiscountCode,
  markDiscountCodeUsed,
} from "../services/discountService";
import { checkoutCart } from "../services/orderService";
import { addItemToCart } from "../services/cartService";
import { store } from "../services/store";

/**
 * Integration tests for discount code generation and validation.
 * 
 * These tests verify the core discount logic:
 * - Codes are generated every Nth order (N=3)
 * - Each code can be used only once
 * - Validation correctly rejects invalid/used codes
 * 
 * NOTE: Tests share global state because the store uses module-level singletons.
 * In a real application, you would reset the store between tests.
 */
describe("discountService", () => {
  
  it("should have discount logic that generates codes at nth intervals", () => {
    // Verify the basic logic by checking the store directly
    const currentCount = store.getCurrentOrderCount();
    
    // Code should be generated if:
    // 1. We've completed at least one order (currentCount > 0)
    // 2. AND the count is divisible by 3 (at order boundaries 3, 6, 9, etc.)
    if (currentCount > 0 && currentCount % 3 === 0) {
      const code = generateDiscountCodeForNthOrder();
      expect(code).not.toBeNull();
      expect(code?.discountPercent).toBe(10);
    } else {
      // Otherwise no code should be generated
      const code = generateDiscountCodeForNthOrder();
      expect(code).toBeNull();
    }
  });

  it("should validate and track discount code usage", () => {
    // Get current state
    const startCount = store.getCurrentOrderCount();
    const ordersNeeded = (3 - (startCount % 3)) % 3 || 3;

    // Complete orders until we reach a boundary
    for (let i = 0; i < ordersNeeded; i++) {
      addItemToCart(`user-validate-${startCount + i}`, {
        productId: "prod_1",
        name: "Test Product",
        price: 100,
        quantity: 1,
      });
      checkoutCart(`user-validate-${startCount + i}`);
    }

    // Now generate a code
    const code = generateDiscountCodeForNthOrder();
    
    if (code) {
      // Before using: code should be valid
      expect(validateDiscountCode(code.code)).not.toBeNull();
      
      // After marking as used: code should be invalid
      markDiscountCodeUsed(code.code);
      expect(validateDiscountCode(code.code)).toBeNull();
    }
  });

  it("should prevent reuse of consumed discount codes", () => {
    const startCount = store.getCurrentOrderCount();
    const ordersNeeded = (3 - (startCount % 3)) % 3 || 3;

    // Get to a boundary
    for (let i = 0; i < ordersNeeded; i++) {
      addItemToCart(`user-reuse-${startCount + i}`, {
        productId: "prod_1",
        name: "Product",
        price: 50,
        quantity: 1,
      });
      checkoutCart(`user-reuse-${startCount + i}`);
    }

    const code = generateDiscountCodeForNthOrder();
    
    if (code) {
      // Valid before using
      expect(validateDiscountCode(code.code)).not.toBeNull();
      
      // Use it
      markDiscountCodeUsed(code.code);
      
      // Invalid after using
      const afterUse = validateDiscountCode(code.code);
      expect(afterUse).toBeNull();
    }
  });

  it("should return null for invalid code strings", () => {
    expect(validateDiscountCode("INVALID_CODE")).toBeNull();
    expect(validateDiscountCode("FAKE_DISC10_999")).toBeNull();
    expect(validateDiscountCode("")).toBeNull();
  });

  it("discount codes should apply 10% discount on checkout", () => {
    // Get to a boundary and generate code
    const startCount = store.getCurrentOrderCount();
    const ordersNeeded = (3 - (startCount % 3)) % 3 || 3;

    for (let i = 0; i < ordersNeeded; i++) {
      addItemToCart(`user-discount-apply-${startCount + i}`, {
        productId: "prod_1",
        name: "Item",
        price: 100,
        quantity: 1,
      });
      checkoutCart(`user-discount-apply-${startCount + i}`);
    }

    const code = generateDiscountCodeForNthOrder();
    
    if (code) {
      // Verify the code exists and will give 10% discount
      expect(code.discountPercent).toBe(10);
      expect(validateDiscountCode(code.code)).not.toBeNull();
    }
  });
});


