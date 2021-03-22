import { createContext, ReactNode, useContext, useState } from 'react';
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
    const storagedCart =  localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      api.get(`stock/${productId}`)
        .then(response => response.data)
        .then(function(result) {
           if (result.amount >= 1) {
            if (cart.length !== 0)
            {
              cart.map(item => {
                if(item.id === productId)
                {
                  item.amount++;
                  result.amount--;
                }
              })
            }
            else {
              api.get(`products/${productId}`)
                .then(response => response.data)
                .then(function (result) {
                  setCart([
                    ...cart,
                    result,
                  ])
                });
            }
          }
          else {
            toast.error('Quantidade solicitada fora de estoque');
          }
        })
      localStorage.setItem('@RocketShoes:cart', String(cart));
      // TODO
    } catch {
      toast.error('Erro na adição do produto');
      // TODO
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

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
