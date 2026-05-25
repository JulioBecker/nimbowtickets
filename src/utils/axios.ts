import axios from 'axios'
// config
import { HOST_API } from 'src/config-global'
import { useAuthStore } from 'src/store/auth'
import { applyLocalMock } from './mock-api'

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API })

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong'),
)

axiosInstance.interceptors.request.use(
  async (config) => {
    const { token } = useAuthStore.getState()
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }
    return applyLocalMock(config)
  },
  (error) => Promise.reject(error),
)
export default axiosInstance
