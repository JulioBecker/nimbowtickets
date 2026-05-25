import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserDTO {
  email: string
  password?: string
  name: string
  photo?: string
  role?: 'user' | 'admin' | 'franchisee'
  _id?: string
  phone?: string
  document?: string
  gender?: string
  birthDate?: string | Date
  cep?: string
  hasDisability?: boolean
  favorites?: string[]
  cashlessBalances?: { event: string; balance: number; qrCode: string }[]
  producerSlug?: string
  producerName?: string
  producerDescription?: string
  producerBanner?: string
  producerLogo?: string
  followingProducers?: string[]
}

type State = {
  user?: UserDTO
}

type Actions = {
  setUser: (user?: UserDTO) => void
  logout: () => void
}

export const useUserStore = create(
  persist<State & Actions>(
    (set) => ({
      user: undefined,
      setUser: (user?: UserDTO) =>
        set(() => ({
          user,
        })),
      logout: () =>
        set(() => ({
          user: undefined,
        })),
    }),
    {
      name: 'user',
    },
  ),
)
