import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 15000 });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('shoufli_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('shoufli_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const tmdbImage   = (path, size='w342') => path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
export const tmdbBackdrop = (path) => path ? `https://image.tmdb.org/t/p/w1280${path}` : null;

export const authAPI = {
  register:           d       => api.post('/auth/register', d),
  login:              d       => api.post('/auth/login', d),
  getMe:              ()      => api.get('/auth/me'),
  updateTheme:        theme   => api.put('/auth/theme', { theme }),
  updateLang:         lang    => api.put('/auth/lang', { lang }),
  verifyPin:          pin     => api.post('/auth/verify-pin', { pin }),
  verifyEmail:        code    => api.post('/auth/verify-email', { code }),
  resendVerification: ()      => api.post('/auth/resend-verification'),
  forgotPassword:     (e,l)   => api.post('/auth/forgot-password', { email:e, lang:l }),
  resetPassword:      (t,pw)  => api.post(`/auth/reset-password/${t}`, { password:pw }),
};

export const moviesAPI = {
  getMovies:  params => api.get('/movies', { params }),
  getMovie:   id     => api.get(`/movies/${id}`),
  search:     params => api.get('/movies/search', { params }),
  getGenres:  ()     => api.get('/movies/genres'),
};

export const reviewsAPI = {
  create:      d       => api.post('/reviews', d),
  getForMovie: movieId => api.get(`/reviews/${movieId}`),
  delete:      id      => api.delete(`/reviews/${id}`),
};

export const favoritesAPI = {
  add:    d       => api.post('/favorites', d),
  remove: movieId => api.delete(`/favorites/${movieId}`),
  getAll: ()      => api.get('/favorites'),
};

export const historyAPI = {
  add:    d  => api.post('/watchhistory', d),
  getAll: () => api.get('/watchhistory'),
};

export const chatbotAPI  = { chat: d => api.post('/chatbot', d) };

export const recommendationsAPI = {
  get:   params => api.get('/recommendations', { params }),
  aiGet: d      => api.post('/ai-recommendations', d),
};

export const profilesAPI = {
  create:     d       => api.post('/profiles', d),
  getAll:     ()      => api.get('/profiles'),
  update:     (id,d)  => api.put(`/profiles/${id}`, d),
  delete:     id      => api.delete(`/profiles/${id}`),
  getHistory: id      => api.get(`/profiles/${id}/history`),
};

export default api;
