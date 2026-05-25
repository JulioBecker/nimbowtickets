import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type State = {
  token?: string
  loading: boolean
  signed: boolean
}

type Actions = {
  setToken: (token?: string) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create(
  persist<State & Actions>(
    (set) => ({
      token: undefined,
      signed: false,
      loading: false,
      setToken: (token?: string) =>
        set(() => ({
          token,
          signed: true,
          loading: false,
        })),
      setLoading: (loading: boolean) =>
        set(() => ({
          loading,
        })),
      logout: () =>
        set(() => ({
          token: undefined,
          signed: false,
        })),
    }),
    {
      name: 'auth',
    },
  ),
)
