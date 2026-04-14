import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '../api/axios';

const Viewer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            // Validate if ID is a number to prevent backend 422 errors
            if (isNaN(id) || !Number.isInteger(parseFloat(id))) {
                setError("ID de curso inválido na URL.");
                setLoading(false);
                return;
            }

            try {
                // Fetch course details by ID
                const response = await api.get(`/api/courses/${id}`);
                setCourse(response.data);
            } catch (err) {
                console.error("Erro ao carregar o curso:", err);
                setError(err.response?.data?.detail || "Não foi possível carregar as informações deste curso.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col h-screen bg-gray-50">
                {/* Header Skeleton */}
                <header className="bg-white p-4 shadow flex items-center h-16 shrink-0">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mr-4"></div>
                    <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                </header>
                {/* Content Skeleton */}
                <main className="flex-grow p-4 md:p-8 flex items-center justify-center">
                    <div className="w-full max-w-4xl h-full min-h-[60vh] bg-gray-200 rounded-lg animate-pulse shadow-inner border border-gray-300"></div>
                </main>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Ops! Algo deu errado.</h1>
                <p className="text-gray-600 mb-8 text-center max-w-md">
                    {error || "Curso não encontrado."}
                </p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Voltar ao Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
            <header className="bg-white px-4 py-3 shadow flex justify-between items-center z-10 shrink-0">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 mr-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Voltar ao Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-800 truncate pr-4">
                        {course.title}
                    </h1>
                </div>

                {course.file_type && (
                    <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {course.file_type.toUpperCase()}
                    </span>
                )}
            </header>

            <main className="flex-grow w-full bg-gray-200 relative">
                {/*
                    O iframe renderiza o conteúdo que vem do Google Drive ou YouTube.
                    Se for link do Google Drive, idealmente ele deve terminar em /preview
                    para ser embutido sem erros de restrição de iframe.
                */}
                <iframe
                    src={course.link_drive}
                    title={course.title}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    onError={(e) => console.error("Erro ao carregar o iframe", e)}
                />
            </main>
        </div>
    );
};

export default Viewer;
