import React from 'react';
import { Home, BookOpen, Heart, Settings, LogOut, GraduationCap, BarChart2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../services/api';

const Sidebar = ({ activeTab, setActiveTab, userRole, user }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: Home },
        { id: 'explore', label: 'Explore Courses', icon: BookOpen },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
        { id: 'my-courses', label: 'My Learning', icon: GraduationCap },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
        { id: 'admin', label: 'Tutor Dashboard', icon: BarChart2, role: 'TUTOR' }, // Only for Tutors
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col h-screen sticky top-0 left-0 shadow-lg shadow-gray-100/50 z-20">
            {/* Logo Area */}
            <div className="h-20 flex items-center px-8 border-b border-gray-50">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-blue-500/30">
                    <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                    StudySync
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    // Skip if role doesn't match
                    if (item.role && item.role !== userRole) return null;

                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-blue-50 text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon
                                className={`h-5 w-5 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                                    }`}
                            />
                            <span className="font-medium text-sm">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-4 border-t border-gray-50">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full bg-gray-50 rounded-xl p-4 flex items-center space-x-3 mb-3 hover:bg-gray-100 transition-colors text-left ${activeTab === 'profile' ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md uppercase">
                        {/* Initials placeholder */}
                        {user?.firstName ? user.firstName[0] : (user?.username?.[0] || 'U')}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                            {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : (user?.username || "User Account")}
                        </p>
                        <p className="text-xs text-gray-500 truncate capitalize">{userRole?.toLowerCase()}</p>
                    </div>
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 text-gray-500 hover:text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
