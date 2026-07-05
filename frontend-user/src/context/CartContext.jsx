import { createContext, useState, useMemo, useContext } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const deliveryFee = cart.length > 0 ? 39 : 0;
  const taxes = Math.round(cartSubtotal * 0.05);
  const grandTotal = cartSubtotal + deliveryFee + taxes;

  function addToCart(menuItem, restaurant) {
    setCart((current) => {
      // If we add items from another restaurant, reset cart to new restaurant items
      if (current.length > 0 && current[0].restaurantId !== restaurant.id) {
        return [
          {
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
            restaurantId: restaurant.id,
            restaurantName: restaurant.name
          }
        ];
      }

      const existing = current.find((item) => item.id === menuItem.id);
      if (existing) {
        return current.map((item) =>
          item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [
        ...current,
        {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name
        }
      ];
    });
  }

  function changeQuantity(itemId, delta) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        selectedRestaurantId,
        setSelectedRestaurantId,
        cartSubtotal,
        deliveryFee,
        taxes,
        grandTotal,
        addToCart,
        changeQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
