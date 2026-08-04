import axios, { AxiosError } from "axios";
import { API_URL } from "@/config/env";
const server = axios.create({
    baseURL: API_URL,
    timeout: 180000
});

server.interceptors.request.use((response) => {
    return response;
}, (error) => {
    return Promise.reject(error);
})

// Interceptor de resposta para capturar erros (inclui timeout)
server.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
            // Dispara mensagem se o tempo foi excedido
            console.error("⏳ A requisição demorou demais. Verifique sua conexão com a internet.");
            // Você pode trocar por um toast, alert, ou callback personalizado
            alert("Sua conexão está lenta. Tente novamente mais tarde ou Tente o modo Offline.");
        }
        return Promise.reject(error);
    }
);

export { server };

