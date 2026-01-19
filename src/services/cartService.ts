import type { Cart, CartItem } from "../types/domain";
import { store } from "./store";

/**
 * Retrieves the shopping cart for a user.
 * Creates an empty cart if one doesn't exist.
 * 
 * @param userId The user's unique identifier
 * @returns The user's shopping cart
 */
export function getCartForUser(userId: string): Cart {
  return store.getCart(userId);
}

/**
 * Adds an item to a user's cart.
 * If the item already exists in the cart, increases its quantity.
 * Otherwise, adds the item as a new entry.
 * 
 * @param userId The user's unique identifier
 * @param item The item to add (productId, name, price, quantity)
 * @returns The updated cart
 */
export function addItemToCart(
  userId: string,
  item: CartItem,
): Cart {
  const cart = store.getCart(userId);
  const existing = cart.items.find(
    (i) => i.productId === item.productId,
  );

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.items.push({ ...item });
  }

  store.saveCart(userId, cart);
  return cart;
}

/**
 * Applies a discount code to a user's cart.
 * The code will be validated during checkout before the discount is applied.
 * 
 * @param userId The user's unique identifier
 * @param code The discount code to apply
 * @returns The updated cart with the applied discount code
 */
export function applyDiscountCodeToCart(
  userId: string,
  code: string,
): Cart {
  const cart = store.getCart(userId);
  cart.appliedDiscountCode = code;
  store.saveCart(userId, cart);
  return cart;
}

