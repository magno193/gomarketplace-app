import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storageProducts = await AsyncStorage.getItem('@GoMarketplace:cart');

      storageProducts && setProducts([...JSON.parse(storageProducts)]);
    }

    loadProducts();
  }, []);

  // console.log(`cart: ${products}`);

  const addToCart = useCallback(
    async product => {
      const productExists = products.find(prod => prod.id === product.id);

      if (productExists) {
        setProducts(
          products.map(prod =>
            prod.id === product.id
              ? {
                  ...product,
                  quantity: prod.quantity + 1,
                }
              : prod,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const addProduct = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      );
      setProducts(addProduct);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(addProduct),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const removeProduct = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity - 1 }
          : product,
      );

      // const findQuantity = removeProduct.find(prod => prod.id === id);
      // // console.log(findQuantity);
      // if (findQuantity?.quantity === 0) {
      //   const deleteProduct = products.filter(prod => prod.id !== id);
      //   console.log(deleteProduct);
      //   setProducts(deleteProduct);
      // }

      setProducts(removeProduct);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(removeProduct),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
