import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchX, ImageOff } from 'lucide-react';
import { api } from '../api/axios';
import { useAuth } from '../context/AuthContext';

const FallbackImage = ({ title }) => (
    <div className="w-full h-48 bg-gray-200 flex flex-col items-center justify-center text-gray-500">
        <ImageOff className="w-10 h-10 mb-2 opacity-50" />
        <span className="text-sm font-medium">{title || "Sem Imagem"}</span>
    </div>
);

const CourseImage = ({ url, title }) => {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return <FallbackImage title={title} />;
    }

    return (
        <img
            src={url}
            alt={title}
            className="w-full h-48 object-cover"
            onError={() => setHasError(true)}
        />
    );
};

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('/api/courses');
                // O backend retorna uma lista diretamente na resposta
                setCourses(response.data || []);
            } catch (error) {
                console.error("Erro ao buscar cursos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <header className="flex justify-between items-center mb-8 bg-white p-4 rounded shadow">
                <h1 className="text-xl font-bold text-gray-800">Meus Cursos</h1>
                <div className="flex items-center gap-4">
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
                ) : courses.length === 0 ? (
                    // Estado Vazio
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <SearchX className="w-16 h-16 mb-4 text-gray-400" />
                        <h2 className="text-xl font-medium">Você ainda não está matriculado em nenhum curso.</h2>
                    </div>
                ) : (
                    // Grid Responsivo de Cursos
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div key={course.id} className="bg-white flex flex-col rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
                                {course.thumbnail_url ? (
                                    <CourseImage url={course.thumbnail_url} title={course.title} />
                                ) : (
                                    <FallbackImage title={course.title} />
                                )}
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">
                                        {course.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">
                                        {course.description || "Sem descrição disponível."}
                                    </p>
                                    <button
                                        onClick={() => navigate(`/course/${course.id}`)}
                                        className="mt-auto px-4 py-2 text-center text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Acessar
                                    </button>
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
