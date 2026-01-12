import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

// Add a request interceptor to include the JWT token
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

// Add a response interceptor to handle 401 (Unauthorized) responses
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token is expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Check if we are already on the login page to avoid loops
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/authenticate`, { email, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data)); // Store basic user info if available
    }
    return response.data;
};

export const register = async (userData) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// --- Course Context ---
export const getAllCourses = async () => {
    const response = await api.get('/courses');
    return response.data;
};

export const getCourseById = async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
};

export const getMyCreatedCourses = async () => {
    const response = await api.get('/courses/my-courses');
    return response.data;
};

export const searchCourses = async (params) => {
    const response = await api.get('/courses/search', { params });
    return response.data;
};

export const deleteCourse = async (courseId) => {
    await api.delete(`/courses/${courseId}`);
};

export const updateCourse = async (courseId, data) => {
    const response = await api.put(`/courses/${courseId}`, data);
    return response.data;
};

export const addModule = async (courseId, moduleData) => {
    const response = await api.post(`/courses/${courseId}/modules`, moduleData);
    return response.data;
};

export const updateModule = async (courseId, moduleId, moduleData) => {
    const response = await api.put(`/courses/${courseId}/modules/${moduleId}`, moduleData);
    return response.data;
};

export const deleteModule = async (courseId, moduleId) => {
    await api.delete(`/courses/${courseId}/modules/${moduleId}`);
};

// --- Wishlist Context ---
export const addToWishlist = async (courseId) => {
    const response = await api.post(`/wishlist/${courseId}`);
    return response.data;
};

export const removeFromWishlist = async (courseId) => {
    await api.delete(`/wishlist/${courseId}`);
};

export const getWishlist = async () => {
    const response = await api.get('/wishlist');
    return response.data;
};

// --- Enrollment Context ---
export const enrollInCourse = async (courseId) => {
    const response = await api.post('/enrollments', { courseId });
    return response.data;
};

export const getMyEnrollments = async () => {
    const response = await api.get('/enrollments/my-enrollments');
    return response.data;
};

export const checkEnrollmentStatus = async (courseId) => {
    const response = await api.get(`/enrollments/check/${courseId}`);
    return response.data;
};

export const updateProgress = async (courseId, progress) => {
    await api.put(`/enrollments/${courseId}/progress`, null, { params: { progress } });
};

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// --- User Context ---
export const getCurrentUser = async () => {
    const response = await api.get('/user/me');
    return response.data;
};

export const updateProfile = async (data) => {
    const response = await api.put('/user/profile', data);
    return response.data;
};

export const getUserActivity = async () => {
    const response = await api.get('/user/activity');
    return response.data;
};

export const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

// --- Discussion Context ---
export const getModuleDiscussions = async (moduleId) => {
    const response = await api.get(`/discussions/module/${moduleId}`);
    return response.data;
};

export const postDiscussion = async (data) => {
    const response = await api.post('/discussions', data);
    return response.data;
};

export const replyToDiscussion = async (id, data) => {
    const response = await api.post(`/discussions/${id}/reply`, data);
    return response.data;
};

export const upvoteDiscussion = async (id) => {
    const response = await api.put(`/discussions/${id}/upvote`);
    return response.data;
};

export default api;
