import React, { useState, useEffect } from 'react';
import { getAllCourses, searchCourses, getWishlist, getMyEnrollments, getMyCreatedCourses, deleteCourse, getUserActivity } from '../services/api';
import CourseCard from '../components/CourseCard';
import Sidebar from '../components/Sidebar';
import ComparisonModal from '../components/ComparisonModal';
import ProfileSettings from '../components/ProfileSettings';
import StudentAnalytics from '../components/StudentAnalytics';
import { Search, Filter, Sparkles, Bell, Trophy, Clock, Target, GraduationCap, Heart, BookOpen, CheckCircle, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const [courses, setCourses] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]); // Raw enrollments for analytics
    const [activityData, setActivityData] = useState([]);
    const [createdCourses, setCreatedCourses] = useState([]);
    const [selectedCourses, setSelectedCourses] = useState([]); // For comparison
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('explore');
    const [user, setUser] = useState(null);
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        isFree: false,
        sortBy: 'newest'
    });

    const [wishlistIds, setWishlistIds] = useState(new Set());

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                if (parsedUser.role === 'TUTOR') {
                    setActiveTab('admin');
                }
                // Fetch wishlist IDs to sync UI
                fetchWishlistIds();
            } catch (error) {
                console.error("Failed to parse user data from local storage", error);
                localStorage.removeItem('user');
                localStorage.removeItem('token'); // Also clear token to force fresh login
                // Optional: Redirect to login or handled by a guard
            }
        }
    }, []);

    const fetchWishlistIds = async () => {
        try {
            const data = await getWishlist();
            const ids = new Set(data.map(c => c.id));
            setWishlistIds(ids);
        } catch (error) {
            console.error("Failed to fetch wishlist IDs", error);
        }
    };

    const handleWishlistChange = (courseId, isAdded) => {
        setWishlistIds(prev => {
            const newSet = new Set(prev);
            if (isAdded) {
                newSet.add(courseId);
            } else {
                newSet.delete(courseId);
            }
            return newSet;
        });

        // Also update the full wishlist array if we are in that tab or to keep it fresh
        if (activeTab === 'wishlist') {
            // If removing, filter it out immediately from the view for responsiveness
            if (!isAdded) {
                setWishlist(prev => prev.filter(c => c.id !== courseId));
            }
            // If adding, we'd theoretically need to fetch the course details or add it from 'courses' if we have it
            // But usually you add from Explore tab, so wishlist tab just needs a refresh next time it opens
        }
    };

    // Fetch data based on active tab
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'explore') {
                    const delayDebounceFn = setTimeout(async () => {
                        await performSearch();
                    }, 500);
                    return () => clearTimeout(delayDebounceFn);
                } else if (activeTab === 'wishlist') {
                    const data = await getWishlist();
                    setWishlist(data);
                    // Also sync IDs
                    setWishlistIds(new Set(data.map(c => c.id)));
                    setLoading(false);
                } else if (activeTab === 'my-courses') {
                    const data = await getMyEnrollments();
                    setEnrolledCourses(data.map(enrollment => enrollment.course));
                    setLoading(false);
                } else if (activeTab === 'admin') {
                    const data = await getMyCreatedCourses();
                    setCreatedCourses(data);
                    setLoading(false);
                } else if (activeTab === 'analytics') {
                    const data = await getMyEnrollments();
                    const activity = await getUserActivity();
                    setEnrollments(data);
                    setActivityData(activity);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        if (activeTab !== 'explore') {
            fetchData();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'explore') {
            const delayDebounceFn = setTimeout(() => {
                performSearch();
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [searchTerm, filters, activeTab]);


    const performSearch = async () => {
        try {
            setLoading(true);
            const params = {
                keyword: searchTerm,
                ...filters
            };
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) delete params[key];
            });

            const data = await searchCourses(params);
            setCourses(data);
        } catch (error) {
            console.error('Error searching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCompare = (course) => {
        if (selectedCourses.find(c => c.id === course.id)) {
            setSelectedCourses(prev => prev.filter(c => c.id !== course.id));
        } else {
            if (selectedCourses.length < 3) {
                setSelectedCourses(prev => [...prev, course]);
            }
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            try {
                await deleteCourse(courseId);
                // Refresh list
                const data = await getMyCreatedCourses();
                setCreatedCourses(data);
            } catch (error) {
                console.error("Failed to delete course", error);
                alert("Failed to delete course.");
            }
        }
    };

    // --- Render Helpers ---

    const renderOverview = () => (
        <div className="space-y-8 animate-fadeIn">
            {/* Unique Welcome Banner for Overview */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-8 text-white shadow-2xl">
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName || 'Student'}!</h2>
                    <p className="text-indigo-100 text-lg opacity-90">You're on a 5-day streak. Keep it up!</p>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Courses in Progress', value: enrolledCourses.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50/50' },
                    { label: 'Completed Courses', value: '2', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50/50' },
                    { label: 'Learning Hours', value: '12.5h', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50/50' }
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                        className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-white/20 flex items-center gap-5 transition-all"
                    >
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} shadow-sm`}>
                            <stat.icon className="h-7 w-7" />
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-gray-800 tracking-tight">{stat.value}</div>
                            <div className="text-sm font-medium text-gray-500">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Continue Learning Section */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-500" /> Continue Learning
                    </h3>
                </div>
                {enrolledCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrolledCourses.slice(0, 3).map(course => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                isWishlisted={wishlistIds.has(course.id)}
                                onWishlistChange={handleWishlistChange}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white/60 rounded-3xl border border-dashed border-gray-300">
                        <div className="text-gray-400 text-lg">No courses in progress. Start exploring!</div>
                        <button onClick={() => setActiveTab('explore')} className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                            Explore Courses
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const renderExplore = () => (
        <div className="space-y-6 animate-fadeIn">
            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search for courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <select
                        className="bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-medium text-gray-700 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                        value={filters.category || ''}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    >
                        <option value="">All Categories</option>
                        <option value="Development">Development</option>
                        <option value="Business">Business</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                    </select>
                    <select
                        className="bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-medium text-gray-700 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                        value={filters.level || ''}
                        onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                    >
                        <option value="">All Levels</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                    <select
                        className="bg-gray-50 border-none rounded-xl py-3 px-4 text-sm font-medium text-gray-700 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                        value={filters.sortBy}
                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    >
                        <option value="newest">Newest</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                    <button
                        className={`p-3 rounded-xl transition-colors ${filters.isFree ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                        onClick={() => setFilters({ ...filters, isFree: !filters.isFree })}
                        title="Toggle Free Only"
                    >
                        <span className="text-sm font-bold px-2">Free</span>
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <CourseCard
                                course={course}
                                onToggleCompare={toggleCompare}
                                isSelectedForCompare={selectedCourses.some(c => c.id === course.id)}
                                isWishlisted={wishlistIds.has(course.id)}
                                onWishlistChange={handleWishlistChange}
                            />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No courses found</h3>
                    <p className="text-gray-500">Try adjusting your filters.</p>
                </div>
            )}
        </div>
    );

    const renderWishlist = () => (
        <div className="space-y-6 animate-fadeIn">
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : wishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map(course => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <CourseCard
                                course={course}
                                isWishlisted={true}
                                onWishlistChange={handleWishlistChange}
                            />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="bg-pink-50 p-6 rounded-full mb-4">
                        <Heart className="h-10 w-10 text-pink-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-500 mb-6">Save courses you're interested in for later.</p>
                    <button
                        onClick={() => setActiveTab('explore')}
                        className="bg-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-700 transition shadow-lg shadow-pink-500/20"
                    >
                        Browse Courses
                    </button>
                </div>
            )}
        </div>
    );

    const renderMyCourses = () => (
        <div className="space-y-6 animate-fadeIn">
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2].map((n) => (
                        <div key={n} className="h-80 bg-gray-100 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses.map(course => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <CourseCard
                                course={course}
                                isWishlisted={wishlistIds.has(course.id)}
                                onWishlistChange={handleWishlistChange}
                            />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="bg-indigo-50 p-6 rounded-full mb-4">
                        <GraduationCap className="h-10 w-10 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No courses enrolled yet</h3>
                    <p className="text-gray-500 max-w-sm mb-6">Start your learning journey by exploring our catalog of premium courses.</p>
                    <button
                        onClick={() => setActiveTab('explore')}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20"
                    >
                        Browse Courses
                    </button>
                </div>
            )}
        </div>
    );

    const renderTutorDashboard = () => (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Instructor Dashboard</h2>
                <button
                    onClick={() => window.location.href = '/create-course'}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2"
                >
                    <Sparkles className="h-5 w-5" />
                    Create New Course
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="text-gray-500 text-sm mb-1">Total Students</div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="text-gray-500 text-sm mb-1">Active Courses</div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="text-gray-500 text-sm mb-1">Total Revenue</div>
                    <div className="text-3xl font-bold text-gray-900">$0.00</div>
                </div>
            </div>

            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 mt-8">
                {createdCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 text-left">
                        {createdCourses.map(course => (
                            <div key={course.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900 line-clamp-1">{course.title}</h3>
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Active</span>
                                </div>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">{course.description}</p>
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                    <div className="text-sm font-semibold text-gray-900">${course.price}</div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => window.location.href = `/edit-course/${course.id}`}
                                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 rounded-lg"
                                            title="Edit"
                                        >
                                            <Sparkles className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCourse(course.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-lg"
                                            title="Delete Course"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <p className="text-gray-500 mb-2">You haven't created any courses yet.</p>
                        <button
                            onClick={() => window.location.href = '/create-course'}
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            Get started now
                        </button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] flex font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
            {/* Dynamic Background Orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ x: [0, 30, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-purple-200/40 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, -40, 0], scale: [1, 1.3, 1] }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-20%] left-[20%] w-[700px] h-[700px] bg-indigo-200/40 rounded-full blur-[100px]"
                />
            </div>

            <div className="relative z-10 h-full flex w-full">
                <Sidebar
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    userRole={user?.role}
                    user={user}
                />

                <div className="flex-1 flex flex-col min-w-0">
                    {/* Top Header */}
                    <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 px-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {activeTab === 'overview' && 'Dashboard Overview'}
                                {activeTab === 'profile' && 'My Profile'}
                                {activeTab === 'analytics' && 'Learning Analytics'}
                                {activeTab === 'explore' && 'Explore Courses'}
                                {activeTab === 'my-courses' && 'My Learning'}
                                {activeTab === 'wishlist' && 'Your Wishlist'}
                                {activeTab === 'admin' && 'Instructor Portal'}
                            </h1>
                            <p className="text-gray-500 text-sm">Welcome back, {user?.username?.split('@')[0] || 'Scholar'}!</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 rounded-xl hover:bg-blue-50">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                            </button>
                        </div>
                    </header>

                    {/* Main Content Area */}
                    <main className="flex-1 p-8 overflow-y-auto">
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'explore' && renderExplore()}
                        {activeTab === 'admin' && renderTutorDashboard()}
                        {activeTab === 'my-courses' && renderMyCourses()}
                        {activeTab === 'wishlist' && renderWishlist()}
                        {activeTab === 'profile' && <ProfileSettings />}
                        {activeTab === 'analytics' && <StudentAnalytics enrollments={enrollments} activityData={activityData} />}
                    </main>

                    {/* Comparison Tray */}
                    <AnimatePresence>
                        {selectedCourses.length > 0 && (
                            <motion.div
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 100, opacity: 0 }}
                                className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white px-6 py-4 rounded-full shadow-2xl border border-blue-100 flex items-center gap-6 z-40"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-900">{selectedCourses.length} Courses Selected</span>
                                    <span className="text-gray-400 text-sm">Max 3</span>
                                </div>
                                <div className="h-8 w-px bg-gray-200"></div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedCourses([])}
                                        className="text-gray-500 hover:text-red-500 font-medium text-sm px-3 py-1"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={() => setIsCompareModalOpen(true)}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition"
                                    >
                                        Compare Now
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <ComparisonModal
                        isOpen={isCompareModalOpen}
                        onClose={() => setIsCompareModalOpen(false)}
                        selectedCourses={selectedCourses}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
