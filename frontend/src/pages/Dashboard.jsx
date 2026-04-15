import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { api } from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('my_courses'); // 'my_courses' or 'catalog'
    const [myCourses, setMyCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                const [myCoursesRes, allCoursesRes] = await Promise.all([
                    api.get('/api/users/me/courses'),
                    api.get('/api/courses')
                ]);

                setMyCourses(myCoursesRes.data || []);
                setAllCourses(allCoursesRes.data || []);
            } catch (error) {
                console.error("Erro ao buscar cursos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const handleEnroll = async (courseId) => {
        try {
            await api.post(`/api/courses/${courseId}/enroll`);
            // Refresh data after successful enrollment
            const response = await api.get('/api/users/me/courses');
            setMyCourses(response.data || []);
            setActiveTab('my_courses');
        } catch (error) {
            console.error("Erro ao realizar matrícula:", error);
            alert("Erro ao realizar matrícula.");
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isEnrolled = (courseId) => {
        return myCourses.some(course => course.id === courseId);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-4 rounded shadow gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => setActiveTab('my_courses')}
                        className={`text-xl focus:outline-none pb-1 ${activeTab === 'my_courses' ? 'font-bold text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Meus Cursos
                    </button>
                    <button
                        onClick={() => setActiveTab('catalog')}
                        className={`text-xl focus:outline-none pb-1 ${activeTab === 'catalog' ? 'font-bold text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        Catálogo Geral
                    </button>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                    <span className="text-gray-600 hidden sm:inline">
                        Olá, <strong>{user?.username}</strong>
                    </span>
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition-colors hidden sm:block"
                        >
                            Adicionar Curso
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                    >
                        Sair
                    </button>
                </div>
            </header>

            {/* Mobile Admin Button */}
            {user?.role === 'admin' && (
                <div className="sm:hidden mb-6">
                    <button
                        onClick={() => navigate('/admin')}
                        className="w-full px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                    >
                        Adicionar Novo Curso
                    </button>
                </div>
            )}

            <main className="max-w-7xl mx-auto">
                {loading ? (
                    // Skeleton Loading Grid
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6 mb-6"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'my_courses' && myCourses.length === 0 ? (
                    // Estado Vazio Meus Cursos
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <SearchX className="w-16 h-16 mb-4 text-gray-400" />
                        <h2 className="text-xl font-medium">Você ainda não está matriculado em nenhum curso.</h2>
                        <button
                            onClick={() => setActiveTab('catalog')}
                            className="mt-4 px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                        >
                            Ver Catálogo de Cursos
                        </button>
                    </div>
                ) : activeTab === 'catalog' && allCourses.length === 0 ? (
                     // Estado Vazio Catálogo
                     <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <SearchX className="w-16 h-16 mb-4 text-gray-400" />
                        <h2 className="text-xl font-medium">Nenhum curso disponível no momento.</h2>
                    </div>
                ) : (
                    // Grid Responsivo de Cursos
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(activeTab === 'my_courses' ? myCourses : allCourses).map((course) => (
                            <div key={course.id} className="bg-white flex flex-col rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
                                {course.thumbnail_url ? (
                                    <img
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        className="w-full h-48 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                                        Sem imagem
                                    </div>
                                )}
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">
                                        {course.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">
                                        {course.description || "Sem descrição disponível."}
                                    </p>

                                    {activeTab === 'my_courses' ? (
                                        <button
                                            onClick={() => navigate(`/course/${course.id}`)}
                                            className="mt-auto px-4 py-2 text-center text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            Acessar
                                        </button>
                                    ) : (
                                        isEnrolled(course.id) ? (
                                            <div className="mt-auto px-4 py-2 text-center text-sm font-medium text-green-700 bg-green-100 rounded-md flex items-center justify-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Já Matriculado
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEnroll(course.id)}
                                                className="mt-auto px-4 py-2 text-center text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                                            >
                                                Matricular-se
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
