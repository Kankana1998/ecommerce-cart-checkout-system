import type { Cart, DiscountCode, Order, StoreStats } from "../types/domain";

/**
 * In-Memory Store Module
 * 
 * Provides a simple in-memory data store for the ecommerce system.
 * Uses module-level singletons to persist data during the application runtime.
 * 
 * Key responsibilities:
 * - Manage shopping carts for users
 * - Track completed orders
 * - Manage discount codes
 * - Track order count for discount generation
 * - Provide store statistics
 * 
 * NOTE: Data is not persisted to disk. It resets on server restart.
 */

const carts = new Map<string, Cart>();
const orders: Order[] = [];
const discountCodes: DiscountCode[] = [];

let globalOrderCount = 0;
const NTH_ORDER_FOR_DISCOUNT = 3; // Generate discount code every 3rd order

export const store = {
  /**
   * Retrieves a user's shopping cart, creating an empty one if needed.
   */
  getCart(userId: string): Cart {
    const existing = carts.get(userId);
    if (existing) return existing;
    const empty: Cart = { items: [] };
    carts.set(userId, empty);
    return empty;
  },

  /**
   * Saves a user's shopping cart.
   */
  saveCart(userId: string, cart: Cart): void {
    carts.set(userId, cart);
  },

  /**
   * Clears a user's shopping cart (called after successful checkout).
   */
  clearCart(userId: string): void {
    carts.set(userId, { items: [] });
  },

  /**
   * Records a completed order and increments the global order count.
   * @param order The order to save
   */
  addOrder(order: Order): void {
    orders.push(order);
    globalOrderCount += 1;
  },

  /**
   * Gets the order number that will be assigned to the next order.
   * @returns The next order number (currentCount + 1)
   */
  getNextOrderNumber(): number {
    return globalOrderCount + 1;
  },

  /**
   * Gets the total number of orders completed so far.
   * @returns The current order count
   */
  getCurrentOrderCount(): number {
    return globalOrderCount;
  },

  /**
   * Checks if a discount code should be generated after the latest order.
   * Returns true if the current order count is divisible by NTH_ORDER_FOR_DISCOUNT.
   * 
   * Example with NTH_ORDER_FOR_DISCOUNT = 3:
   * - After order 1 or 2: returns false
   * - After order 3: returns true (discount generated)
   * - After order 4 or 5: returns false
   * - After order 6: returns true (next discount generated)
   * 
   * @returns true if a discount code should be generated, false otherwise
   */
  shouldGenerateDiscountForNextOrder(): boolean {
    return (globalOrderCount % NTH_ORDER_FOR_DISCOUNT) === 0;
  },

  /**
   * Adds a new discount code to the store.
   * @param code The discount code to add
   */
  addDiscountCode(code: DiscountCode): void {
    discountCodes.push(code);
  },

  /**
   * Finds a discount code by its code string.
   * @param code The code to search for
   * @returns The discount code object, or undefined if not found
   */
  findDiscountCode(code: string): DiscountCode | undefined {
    return discountCodes.find((d) => d.code === code);
  },

  /**
   * Marks a discount code as used (called when applied to an order).
   * Once marked as used, the code can no longer be applied to orders.
   * @param code The code to mark as used
   */
  markDiscountCodeUsed(code: string): void {
    const found = discountCodes.find((d) => d.code === code);
    if (found) {
      found.isUsed = true;
    }
  },

  /**
   * Retrieves comprehensive statistics about store performance.
   * Aggregates data from all completed orders.
   * 
   * @returns Store statistics including:
   *   - totalItemsPurchased: Count of all items sold
   *   - totalPurchaseAmount: Sum of all order subtotals (before discount)
   *   - totalDiscountAmount: Sum of all discounts applied
   *   - discountCodes: List of all generated codes and their status
   */
  getStats(): StoreStats {
    let totalItemsPurchased = 0;
    let totalPurchaseAmount = 0;
    let totalDiscountAmount = 0;

    for (const order of orders) {
      const itemsCount = order.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      totalItemsPurchased += itemsCount;
      totalPurchaseAmount += order.totalAmount;
      totalDiscountAmount += order.discountAmount;
    }

    return {
      totalItemsPurchased,
      totalPurchaseAmount,
      totalDiscountAmount,
      discountCodes: [...discountCodes],
    };
  },
};

