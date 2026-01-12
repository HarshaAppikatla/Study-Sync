import React from 'react';
import { BookOpen, Star, User, ArrowRight, Heart, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';

const CourseCard = ({ course, onToggleCompare, isSelectedForCompare, isWishlisted: propIsWishlisted, onWishlistChange }) => {
    const { isWishlisted, toggleWishlist } = useWishlist(course.id, propIsWishlisted, onWishlistChange);
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/course/${course.id}`)}
            className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border ${isSelectedForCompare ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-100'} flex flex-col h-full relative cursor-pointer`}
        >
            <div className={`h-48 relative overflow-hidden ${course.thumbnail ? '' : 'bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600'}`}>
                {course.thumbnail ? (
                    <div className="w-full h-full group-hover:scale-110 transition-transform duration-500">
                        <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.parentElement.style.display = 'none'; // Hide image container
                                e.target.parentElement.parentElement.classList.add('bg-gradient-to-br', 'from-violet-600', 'via-indigo-600', 'to-blue-600'); // Re-add gradient
                            }}
                        />
                        {/* Fallback pattern overlay on top of image for style? Maybe not necessary for image. */}
                    </div>
                ) : (
                    <>
                        {/* Pattern Overlay */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(rgba(255,255,255,0.4)_1px,transparent_1px)] [background-size:16px_16px]"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-white/20 group-hover:scale-110 transition-transform duration-500">
                            <BookOpen className="h-20 w-20" />
                        </div>
                    </>
                )}

                <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-lg text-sm font-bold text-indigo-600 shadow-md border border-white/50">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                </div>

                <button
                    onClick={toggleWishlist}
                    className={`absolute top-4 left-4 p-2.5 rounded-full shadow-md transition-colors ${isWishlisted ? 'bg-white text-pink-500' : 'bg-white/90 text-gray-400 hover:bg-white hover:text-pink-500'}`}
                >
                    <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>

                {/* Compare Checkbox */}
                {onToggleCompare && (
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleCompare(course);
                        }}
                        className={`absolute bottom-4 right-4 p-2 rounded-lg shadow-lg transition-all cursor-pointer flex items-center gap-2 ${isSelectedForCompare ? 'bg-white text-blue-700 ring-2 ring-white/50' : 'bg-white/95 text-gray-700 hover:bg-white'}`}
                    >
                        <div className={`h-4 w-4 rounded border ${isSelectedForCompare ? 'border-blue-600 bg-blue-100' : 'border-gray-400 bg-gray-50'} flex items-center justify-center`}>
                            {isSelectedForCompare && <CheckCircle className="h-3 w-3 text-blue-600" />}
                        </div>
                        <span className="text-xs font-bold">Compare</span>
                    </div>
                )}
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-2">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                            {course.category || 'Course'}
                        </span>
                        {course.level && (
                            <span className="text-[10px] uppercase tracking-wider font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                                {course.level}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center text-amber-400 text-sm font-medium bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span className="ml-1 text-gray-700">{course.averageRating?.toFixed(1) || '0.0'}</span>
                    </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                </h3>

                <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-grow">
                    {course.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                    <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center border border-white shadow-sm">
                            <User className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="ml-2 flex flex-col">
                            <span className="text-xs text-gray-400 font-medium">Tutor</span>
                            <span className="text-xs text-gray-700 font-semibold truncate max-w-[100px]">
                                {course.tutor?.firstName} {course.tutor?.lastName}
                            </span>
                        </div>
                    </div>

                    <button className="text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors group/btn">
                        <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
