import axios from "axios";

// Instância base configurada para apontar para o backend
// e enviar/ler cookies httponly automaticamente em todas as requisições
export const api = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true,
});
