'use client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from 'jotai';
import { getToken, isTokenValid } from "../../lib/auth";
import { userAtom } from "../../store/authAtoms";
import { fetchUserInfo } from "../../lib/api";
import Sidebar from "./components/Sidebar";
import LoadingOverlay from "../../components/LoadingOverlay";
import { LuMenu } from 'react-icons/lu';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient();
    const router = useRouter();
    const [user, setUser] = useAtom(userAtom);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        const initializeUser = async () => {
            const token = getToken();
            if (token && isTokenValid(token)) {
                try {
                    const userInfo = await fetchUserInfo();
                    setUser(userInfo);
                } catch (error) {
                    console.error('Failed to fetch user info:', error);
                    router.push('/login');
                }
            } else {
                router.push('/login');
            }
        };

        if (!user) {
            initializeUser();
        }
    }, [user, setUser, router]);

    if (!user) {
        return <LoadingOverlay />
    }

    return (
        <QueryClientProvider client={queryClient}>
            <div className="h-screen w-full flex bg-gray-900 overflow-hidden">
                <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
                <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-30 md:z-0`}>
                    <Sidebar user={user} isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
                </div>
                <div className="flex-1 flex flex-col w-full">
                    <div className="bg-gray-800 p-4 flex items-center md:hidden">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
                            <LuMenu size={24} />
                        </button>
                    </div>
                    <main className={`flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 transition-all duration-200 ease-in-out `}>
                        <div className="container mx-auto px-4 py-8 h-full">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </QueryClientProvider>
    );
};

export default AppLayout;