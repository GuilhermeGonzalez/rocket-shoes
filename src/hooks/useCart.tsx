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
      const resp = await api.get(`stock/${productId}`)
      const saldo = resp.data

      let newCart = [...cart]
      const index = newCart.findIndex(prod => prod.id === productId)

      if (index >= 0 && saldo.amount <= newCart[index].amount) {
        toast.error('Quantidade solicitada fora de estoque')
        return
      }

      if (index >= 0)
        newCart[index].amount++;
      else {
        const { data: product } = await api.get(`products/${productId}`)
        newCart.push({ ...product, amount: 1 })
      }

      setCart(newCart)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
    } catch {
      toast.error('Erro na adição do produto');
      // TODO
    }
  };


  const removeProduct = (productId: number) => {
    try {
      const exist = cart.findIndex(prod => prod.id === productId)
      if (exist < 0)
        return toast.error('Erro na remoção do produto');
      else {
        let newCart = cart.filter(item => item.id !== productId);
        setCart(newCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    if (amount <= 0)
      return
    try {
      const index = cart.findIndex(prod => prod.id === productId)
      let actualAmount = 0

      if (index >= 0)
        actualAmount = cart[index].amount


      if (amount > actualAmount) {
        const { data: stock } = await api.get(`stock/${productId}`)

        if (amount > stock.amount) {
          toast.error('Quantidade solicitada fora de estoque')
          return
        }
      }

      const newCart = cart.map(prod => {
        return prod.id === productId
          ? { ...prod, amount }
          : { ...prod }
      })

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));

      setCart(newCart)

      // TODO
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
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
