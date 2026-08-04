const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL

if (!configuredApiUrl) {
	throw new Error("A variável EXPO_PUBLIC_API_URL não foi configurada.")
}

export const API_URL = configuredApiUrl.replace(/\/+$/, "")
export const WS_URL = `${API_URL.replace(/^http/, "ws")}/chat`
