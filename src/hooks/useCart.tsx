import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {

  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const { data: stock } = await api.get(`stock/${productId}`);
      const { data: product } = await api.get(`products/${productId}`);

      const productExist = cart.some(item => item.id === productId);
      if (productExist) {
        const productAmount = cart.reduce((acc, item) => {
          if (item.id === productId)
            return acc = item.amount;
          else
            return acc + 0;
        }, 0);

        if (stock.amount > productAmount) {
          const cartUpdated = cart.map(item => item.id === productId ? {
            ...item,
            amount: item.amount + 1
          } : item)
          setCart(cartUpdated);
        }
        else {
          toast.error('Quantidade solicitada fora de estoque');
        }
      }
      else {
        setCart([
          ...cart,
          {
            ...product,
            amount: 1
          }
        ])
      }
    } catch {
      toast.error('Erro na adição do produto');
      // TODO
    }
  };


  const removeProduct = (productId: number) => {
    try {
      setCart(cart.filter(item => item.id !== productId));
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const { data: stock } = await api.get(`stock/${productId}`);

      if (stock.amount < amount) {
        toast.error('Quantidade solicitada fora de estoque');
      }
      else {
        const productExist = cart.some(item => item.id === productId);
        if (productExist) {
          const cartUpdated = cart.map(item => item.id === productId ? {
            ...item,
            amount: amount
          } : item)
          setCart(cartUpdated);
        }
        else {
          toast.error('Erro na alteração de quantidade do produto');
        }
      }
      // TODO
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
      // TODO 
    }
  };


  useEffect(() => {
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
  }, [cart])

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
