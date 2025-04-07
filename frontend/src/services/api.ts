import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


export const register = (data: any) => api.post('/auth/register', data);
export const login = (data: any) => api.post('/auth/login', data);
export const requestPasswordReset = (data: { email: string }) => 
  api.post('/auth/request-password-reset', data);

export const resetPassword = (data: { token: string, password: string }) => 
  api.post('/auth/reset-password', data);

  export const verifyOtp = (data: { email: string; otp: string }) =>
  api.post('/auth/verify-otp', data);

  export const resendOtp = (data: {email:string}) => {
    return  api.post('/auth/resend-otp',data);
  
  };
export const uploadImages = (formData: FormData) => api.post('/images/upload', formData);
export const getImages = () => api.get('/images');
export const rearrangeImages = (orderedIds: string[]) => api.put('/images/rearrange', { orderedIds });
export const editImage = (id: string, title: string) => api.put(`/images/${id}`, { title });
export const deleteImage = (id: string) => api.delete(`/images/${id}`);