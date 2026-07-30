import { server } from "@/server/api"

export function applyAuthHeader(token: string | null) {
    if (token) {
        server.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
        delete server.defaults.headers.common["Authorization"]
    }
}

export function applyTeamHeader(teamId: number | null) {
    if (teamId) {
        server.defaults.headers.common["X-Team-Id"] = String(teamId)
    } else {
        delete server.defaults.headers.common["X-Team-Id"]
    }
}