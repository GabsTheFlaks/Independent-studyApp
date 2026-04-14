import React, { createContext, useState, useEffect, useContext } from "react";
import { api } from "../api/axios";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    // O estado do usuário é mantido exclusivamente em memória.
    // Nenhum dado sensível como token vai para localStorage.
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // No carregamento inicial (refresh da página), tentamos
    // renovar a sessão utilizando o cookie HTTP-Only existente.
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.post("/refresh");
                setUser(response.data.user);
            } catch (error) {
                // Se falhar (ex: expirou, sem cookie), garantimos o estado limpo
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (username, password) => {
        // OAuth2PasswordRequestForm no FastAPI espera form data urlencoded
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);

        const response = await api.post("/login", formData, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        // FastAPI retorna a mensagem e o usuário
        setUser(response.data.user);
    };

    const register = async (userData) => {
        // Mapeia userData (username, password, firstname, lastname, email)
        const response = await api.post("/register", userData);
        return response.data;
    };

    const logout = async () => {
        try {
            await api.post("/logout");
        } catch (err) {
            console.error("Erro ao fazer logout", err);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
