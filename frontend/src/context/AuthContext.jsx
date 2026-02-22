/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useEffect } from "react";
import client from "../api/client";

const AuthContext = createContext();

const readStoredUser = () => {
    const stored = localStorage.getItem("user");
    try {
        return stored && stored !== "undefined" ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

const readStoredToken = () => {
    const value = localStorage.getItem("token");
    return value && value !== "undefined" ? value : null;
};

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(readStoredUser);
    const [token, setToken] = useState(readStoredToken);
    const [authReady, setAuthReady] = useState(() => !readStoredToken());

    useEffect(() => {
        if (!token) {
            setUser(null);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setAuthReady(true);
            return;
        }

        setAuthReady(false);
        client
            .get("/auth/me")
            .then((res) => {
                const freshUser = res.data.data;
                setUser(freshUser);
                localStorage.setItem("user", JSON.stringify(freshUser));
                setAuthReady(true);
            })
            .catch(() => {
                setToken(null);
                setUser(null);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setAuthReady(true);
            });
    }, [token]);

    const login = async (email, password) => {
        setAuthReady(false);
        const response = await client.post("/auth/login", { email, password });
        const { token: nextToken, user: nextUser } = response.data.data;
        setToken(nextToken);
        setUser(nextUser);
        localStorage.setItem("token", nextToken);
        localStorage.setItem("user", JSON.stringify(nextUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setAuthReady(true);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    };

    const register = async (name, email, password, organizationName) => {
        setAuthReady(false);
        const response = await client.post("/auth/register", { name, email, password, organizationName });
        const { token: nextToken, user: nextUser } = response.data.data;
        setToken(nextToken);
        setUser(nextUser);
        localStorage.setItem("token", nextToken);
        localStorage.setItem("user", JSON.stringify(nextUser));
    };

    return (
        <AuthContext.Provider value={{ user, token, authReady, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

export { AuthProvider };
