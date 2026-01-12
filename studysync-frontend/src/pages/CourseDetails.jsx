import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, checkEnrollmentStatus, enrollInCourse, getWishlist, getModuleDiscussions } from '../services/api';
import { useWishlist } from '../hooks/useWishlist';
import { Lock, Play, FileText, CheckCircle, AlertCircle, ArrowLeft, Heart, Star, User, BookOpen } from 'lucide-react';
import DiscussionThread from '../components/DiscussionThread';
import { motion, AnimatePresence } from 'framer-motion';

const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeModule, setActiveModule] = useState(null);
    const [fetchedWishlistStatus, setFetchedWishlistStatus] = useState(false);
    const { isWishlisted, toggleWishlist } = useWishlist(id, fetchedWishlistStatus);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [discussions, setDiscussions] = useState([]);

    useEffect(() => {
        if (activeModule?.id) {
            getModuleDiscussions(activeModule.id).then(setDiscussions).catch(console.error);
        }
    }, [activeModule]);

    const handleNewPost = (newPost) => {
        setDiscussions([newPost, ...discussions]);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [courseData, enrollmentStatus, wishlistData] = await Promise.all([
                    getCourseById(id),
                    checkEnrollmentStatus(id),
                    getWishlist()
                ]);
                setCourse(courseData);
                setIsEnrolled(enrollmentStatus);
                setFetchedWishlistStatus(wishlistData.some(item => item.id === Number(id)));

                // Pre-select first module if available
                if (courseData.modules && courseData.modules.length > 0) {
                    setActiveModule(courseData.modules[0]);
                }
            } catch (error) {
                console.error("Failed to load course details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleEnroll = async () => {
        setEnrollLoading(true);
        try {
            await enrollInCourse(id);
            setIsEnrolled(true);
        } catch (error) {
            console.error("Enrollment failed", error);
        } finally {
            setEnrollLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-800">Course not found</h2>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="mt-4 text-blue-600 hover:underline flex items-center"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header / Hero */}
            <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-gray-500 hover:text-gray-700 flex items-center text-sm font-medium mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                    </button>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{course.title}</h1>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <User className="h-4 w-4" /> {course.tutor?.firstName} {course.tutor?.lastName}
                                </span>
                                <span className="flex items-center gap-1 text-amber-500">
                                    <Star className="h-4 w-4 fill-current" /> 4.8 (120 reviews)
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleWishlist}
                                className={`p-3 rounded-xl border transition-colors ${isWishlisted ? 'bg-pink-50 border-pink-200 text-pink-500' : 'bg-white border-gray-200 text-gray-400 hover:text-pink-500 hover:border-pink-200'}`}
                            >
                                <Heart className={`h-6 w-6 ${isWishlisted ? 'fill-current' : ''}`} />
                            </button>
                            {!isEnrolled ? (
                                <button
                                    onClick={handleEnroll}
                                    disabled={enrollLoading}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center gap-2"
                                >
                                    {enrollLoading ? 'Enrolling...' : `Enroll Now for $${course.price}`}
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg font-medium border border-green-100">
                                    <CheckCircle className="h-5 w-5" /> Enrolled
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area (Video Player) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-black rounded-2xl overflow-hidden aspect-video relative shadow-lg group">
                            {isEnrolled && activeModule ? (
                                activeModule.videoUrl && (activeModule.videoUrl.includes('/uploads/') || activeModule.videoUrl.endsWith('.mp4')) ? (
                                    <video
                                        src={activeModule.videoUrl}
                                        controls
                                        className="w-full h-full object-contain bg-black"
                                    />
                                ) : activeModule.videoUrl ? (
                                    <iframe
                                        src={activeModule.videoUrl.replace('watch?v=', 'embed/')}
                                        className="w-full h-full"
                                        title={activeModule.title}
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-gray-900">
                                        <div className="text-center">
                                            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                            <p>This module contains reading material only.</p>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                    <div className="text-center text-white p-6">
                                        <Lock className="h-12 w-12 mx-auto mb-4 text-white/50" />
                                        <h3 className="text-xl font-bold mb-2">Content Locked</h3>
                                        <p className="text-gray-400 max-w-md mx-auto">
                                            {isEnrolled ? "Select a module to start learning." : "Enroll in this course to access the video content and materials."}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Module Details */}
                        {isEnrolled && activeModule && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                            >
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{activeModule.title}</h2>
                                <p className="text-gray-600 leading-relaxed">{activeModule.content}</p>
                                {activeModule.notesUrl && (
                                    <a
                                        href={activeModule.notesUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-blue-600 mt-4 hover:underline font-medium"
                                    >
                                        <FileText className="h-4 w-4" /> Download Notes
                                    </a>
                                )}
                            </motion.div>
                        )}

                        {isEnrolled && activeModule && (
                            <DiscussionThread
                                moduleId={activeModule.id}
                                discussions={discussions}
                                onPost={handleNewPost}
                            />
                        )}

                        {/* Course Description */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">About this Course</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                {course.description}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar: Module List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
                            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="font-bold text-gray-900">Course Content</h3>
                                <p className="text-xs text-gray-500 mt-1">{course.modules?.length || 0} Modules</p>
                            </div>
                            <div className="divide-y divide-gray-50 max-h-[calc(100vh-200px)] overflow-y-auto">
                                {course.modules?.map((module, idx) => (
                                    <button
                                        key={module.id}
                                        onClick={() => isEnrolled && setActiveModule(module)}
                                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex gap-3 ${activeModule?.id === module.id ? 'bg-blue-50/50' : ''}`}
                                        disabled={!isEnrolled}
                                    >
                                        <div className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${isEnrolled ? (activeModule?.id === module.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500') : 'bg-gray-100 text-gray-400'}`}>
                                            {isEnrolled ? (
                                                <Play className="h-3 w-3 fill-current" />
                                            ) : (
                                                <Lock className="h-3 w-3" />
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${activeModule?.id === module.id ? 'text-blue-700' : 'text-gray-700'}`}>
                                                {idx + 1}. {module.title}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                                {module.videoUrl ? 'Video' : 'Reading'}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                                {(!course.modules || course.modules.length === 0) && (
                                    <div className="p-8 text-center text-gray-400 text-sm">
                                        No modules validated yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;
