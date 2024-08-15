import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LuHome, LuUpload, LuUser, LuLogOut, LuChevronLeft, LuChevronRight, LuSettings } from 'react-icons/lu';
import { User } from '../../../types';
import { logout } from '../../../lib/api';

interface SidebarProps {
    user: User;
    isMinimized: boolean;
    setIsMinimized: (isMinimized: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, isMinimized, setIsMinimized }) => {
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const NavLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => (
        <Link href={href} className="flex items-center p-4 hover:bg-gray-700 rounded-lg transition-all duration-300 group">
            <div className="relative">
                <Icon size={24} className="text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                <div className="absolute inset-0 bg-blue-400 opacity-0 group-hover:opacity-20 rounded-full transition-opacity duration-300"></div>
            </div>
            {!isMinimized && <span className="ml-4 text-gray-300 group-hover:text-white transition-colors duration-300">{label}</span>}
        </Link>
    );

    return (
        <div className={`bg-gray-800 text-white transition-all duration-300 ease-in-out ${isMinimized ? 'w-20' : 'w-64'} h-full flex flex-col justify-between shadow-lg`}>
            <div>
                <div className="p-6 flex justify-between items-center border-b border-gray-700">
                    {!isMinimized && <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Novum</h1>}
                    <button 
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        {isMinimized ? <LuChevronRight size={20} /> : <LuChevronLeft size={20} />}
                    </button>
                </div>
                <nav className="mt-8 px-4">
                    <NavLink href="/" icon={LuHome} label="Home" />
                    <NavLink href="/upload" icon={LuUpload} label="Upload" />
                    <NavLink href="/settings" icon={LuSettings} label="Settings" />
                </nav>
            </div>
            <div className="mt-auto">
                <div className="bg-gray-800 p-4 border-t border-gray-700">
                    <div className="flex items-center mb-4">
                        <img 
                            src={user.profilePicUrl || '/default-avatar.png'} 
                            alt={`${user.firstName} ${user.lastName}`} 
                            className="w-10 h-10 rounded-full border-2 border-gray-600 group-hover:border-blue-400 transition-colors duration-300"
                        />
                        {!isMinimized && (
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-medium text-gray-300 truncate">{user.username}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center justify-center p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                        <LuLogOut size={20} className="text-gray-400 group-hover:text-red-400 transition-colors duration-300" />
                        {!isMinimized && <span className="ml-2 text-sm text-gray-300 group-hover:text-white transition-colors duration-300">Logout</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;