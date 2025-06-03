import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://your-api.com/api/',
})

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default instance
