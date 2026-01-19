import { create } from "zustand";

interface CartAlertData {
  image: string;
  name: string;
  variant?: string | number;
  size?: string | number;
}

interface CartAlertStore {
  isOpen: boolean;
  data: CartAlertData | null;
  onOpen: (data: CartAlertData) => void;
  onClose: () => void;
}

const useCartAlert = create<CartAlertStore>((set) => ({
  isOpen: false,
  data: null,
  onOpen: (data) => set({ isOpen: true, data }),
  onClose: () => set({ isOpen: false }),
}));

export default useCartAlert;