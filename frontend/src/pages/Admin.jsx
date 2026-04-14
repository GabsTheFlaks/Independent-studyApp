import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { api } from '../api/axios';

const Admin = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        link_drive: '',
        file_type: 'pdf',
        thumbnail_url: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await api.post('/api/courses', formData);
            setSuccess('Curso cadastrado com sucesso! Redirecionando...');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            console.error("Erro ao cadastrar curso:", err);
            setError(err.response?.data?.detail || 'Erro ao cadastrar o curso. Verifique os dados e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-4 md:p-8">
            <div className="max-w-2xl w-full mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">

                <div className="flex items-center mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-gray-500 hover:text-blue-600 transition-colors mr-3"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Cadastrar Novo Curso
                    </h1>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título do Curso *</label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ex: Introdução ao React"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Breve descrição do que será ensinado."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Ex: Programação, Design"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Arquivo</label>
                            <select
                                name="file_type"
                                value={formData.file_type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="pdf">PDF</option>
                                <option value="video">Vídeo</option>
                                <option value="docs">Documento Docs</option>
                                <option value="pptx">Apresentação PPTX</option>
                                <option value="xls">Planilha XLS</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL de Thumbnail (Imagem)</label>
                        <input
                            type="text"
                            name="thumbnail_url"
                            value={formData.thumbnail_url}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link do Google Drive *</label>
                        <input
                            type="text"
                            name="link_drive"
                            required
                            value={formData.link_drive}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://drive.google.com/file/d/.../preview"
                        />
                        <p className="text-xs text-gray-500 mt-1">Lembre-se de usar um link finalizado em "/preview" para melhor compatibilidade com Iframe.</p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                        >
                            {loading ? (
                                "Salvando..."
                            ) : (
                                <>
                                    <Save className="w-5 h-5 mr-2" />
                                    Cadastrar Curso
                                </>
                            )}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default Admin;
