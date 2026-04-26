// AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { loginRequest, msalInstance } from "./authConfig";
import type { AccountInfo, AuthenticationResult } from "@azure/msal-browser";

type AuthContextType = {
    account: AccountInfo | null;
    roles: string[];
    isAuthenticated: boolean;
    login: () => Promise<void>;
    logout: () => void;
    getAccessToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: React.ReactNode}> = ({ children }) => {
    const [account, setAccount] = useState<AccountInfo | null>(null);
    const [roles, setRoles] = useState<string[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    //const { accounts } = useMsal();

    // 🔁 bootstrap dopo refresh
    useEffect(() => {
        const init = async () => {
            //const { accounts } = useMsal();
            const activeAcount = msalInstance.getActiveAccount();

            if (activeAcount) {
                //const acc = accounts[0];
                setAccount(activeAcount);
                setIsAuthenticated(true);

                await loadRoles(activeAcount);
            } else {
                // fallback da localStorage (solo UX)
                const cachedRoles = JSON.parse(localStorage.getItem("roles") || "[]");
                setRoles(cachedRoles);
            }
        };

        init();
    }, []);

    // 🔑 login
    const login = async () => {
        const response = await msalInstance.loginRedirect(loginRequest);
        handleAuthResponse(response);
    };

    // 🚪 logout
    const logout = () => {
        msalInstance.logoutPopup();
        setAccount(null);
        setRoles([]);
        setIsAuthenticated(false);
        localStorage.removeItem("roles");
    };

    // 🎯 gestione risposta auth
    const handleAuthResponse = (response: AuthenticationResult) => {
        if (response.account) {
            setAccount(response.account);
            setIsAuthenticated(true);

            const rolesFromToken = (response.idTokenClaims as any)?.roles || [];
            setRoles(rolesFromToken);

            // persistenza UX
            localStorage.setItem("roles", JSON.stringify(rolesFromToken));
        }
    };

    // 🔄 recupero ruoli via token (post refresh)
    const loadRoles = async (acc: AccountInfo) => {
        try {
            const response = await msalInstance.acquireTokenSilent({
                account: acc,
                scopes: loginRequest.scopes,
            });
            console.log("Token silente acquisito:", response);
            const rolesFromToken = (response.idTokenClaims as any)?.roles || [];

            setRoles(rolesFromToken);
            localStorage.setItem("roles", JSON.stringify(rolesFromToken));
        } catch (err) {
            console.error("Errore acquireTokenSilent", err);
        }
    };

    // 🎟️ access token per API
    const getAccessToken = async (): Promise<string | null> => {
        if (!account) return null;

        try {
            const response = await msalInstance.acquireTokenSilent({
                account,
                scopes: loginRequest.scopes,
            });

            return response.accessToken;
        } catch (e) {
            console.error("Token error", e);
            return null;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                account,
                roles,
                isAuthenticated,
                login,
                logout,
                getAccessToken
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);