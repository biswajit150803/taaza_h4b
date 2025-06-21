import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useUser } from "@civic/auth/react";
import axios from 'axios'

export const AppContext = createContext()

const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const { user, signIn, signOut, authStatus, accessToken, idToken, refreshToken } = useUser();
    const [userData, setUserData] = useState(false)

    const loadUserProfileData = async () => {
        try {
            if (!accessToken) {
                console.log("⛔ No accessToken available. Skipping profile fetch.");
                return;
            }

            console.log("🔄 Fetching backend profile with accessToken:");

            const { data } = await axios.get(backendUrl + '/api/user/profile', {
                headers: { token: idToken },
            });

            if (data.success) {
                setUserData(data.userData);
                console.log("✅ Profile loaded from backend:", data.userData);
            } else {
                console.log("❌ Backend responded with failure:", data.message);
                toast.error("Dhur", data.message);
            }
        } catch (error) {
                console.error("❌ Error loading user profile:", error);
                toast.error(error.message);
            }
        };


    useEffect(() => {
        // Load profile data when user is authenticated via Civic
        if (accessToken) {
            console.log("YES");
            loadUserProfileData()
        } else {
            console.log("NO");
            // Clear user data when not authenticated
            setUserData(false)
        }
    }, [user])

    // Civic Auth login wrapper
    const handleLogin = async () => {
        try {
            await signIn({
                scope: ["email", "name"], // Civic will prompt user for these
            });
        } catch (error) {
            toast.error("Login failed");
            console.error(error);
        }
    }

    // Civic Auth logout wrapper
    const handleLogout = async () => {
        try {
            await signOut();
            setUserData(false);
        } catch (error) {
            toast.error("Logout failed");
            console.error(error);
        }
    }

    const value = {
        backendUrl,        
        // Civic Auth
        user,
        userData, 
        setUserData,
        idToken,
        loadUserProfileData,
        login: handleLogin,
        logout: handleLogout,
        authStatus,
        accessToken,
        isAuthenticated: !!user && authStatus === 'authenticated',
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider