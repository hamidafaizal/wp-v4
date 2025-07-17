import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            apiClient.get('/user')
                .then(response => {
                    setUser(response.data);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    setToken(null);
                    delete apiClient.defaults.headers.common['Authorization'];
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (credentials) => {
        const response = await apiClient.post('/login', credentials);
        const { access_token, user } = response.data;
        localStorage.setItem('token', access_token);
        setToken(access_token);
        setUser(user);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    };

    const register = async (data) => {
        await apiClient.post('/register', data);
    };

    const logout = async () => {
        try {
            await apiClient.post('/logout');
        } catch (error) {
            console.error("Logout failed, possibly due to invalid token on server. Clearing client-side session.", error);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            delete apiClient.defaults.headers.common['Authorization'];
        }
    };

    // Perubahan: Tambahkan fungsi untuk memperbarui state user secara lokal
    const updateUser = (updatedUserData) => {
        setUser(updatedUserData);
    };

    const value = {
        user,
        token,
        login,
        register,
        logout,
        updateUser, // Perubahan: Ekspor fungsi updateUser
        isAuthenticated: !!token,
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
