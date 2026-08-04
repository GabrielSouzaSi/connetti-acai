// contexts/AuthContext.tsx
import { UserDTO } from "@/dtos/userDTO"
import { server } from "@/server/api"
import {
	storageAuthTokenGet,
	storageAuthTokenRemove,
	storageAuthTokenSave,
} from "@/storage/storageAuthToken"
import { storageUserGet, storageUserRemove, storageUserSave } from "@/storage/storageUser"
import axios from "axios"
import { createContext, ReactNode, useEffect, useMemo, useState } from "react"

export type AuthContextDataProps = {
	user: UserDTO | null
	isBootstrapping: boolean // <— só no boot
	authSubmitting: boolean // <— login/logout em andamento
	signIn: (identifier: string, password: string) => Promise<void>
	signOut: () => Promise<void>
}

type AuthContextProviderProps = { children: ReactNode }

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps)

export function AuthContextProvider({ children }: AuthContextProviderProps) {
	const [user, setUser] = useState<UserDTO | null>(null)
	const [isBootstrapping, setIsBootstrapping] = useState(true)
	const [authSubmitting, setAuthSubmitting] = useState(false)
	// const { ensureRegistered, pushToken } = usePush()

	function applyAuthHeader(token: string | null) {
		if (token) {
			server.defaults.headers.common["Authorization"] = `Bearer ${token}`
			axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
		} else {
			delete server.defaults.headers.common["Authorization"]
			delete axios.defaults.headers.common["Authorization"]
		}
	}

	async function signIn(identifier: string, password: string) {
		setAuthSubmitting(true)
		try {
			const normalizedIdentifier = identifier.includes("@")
				? identifier.trim().toLowerCase()
				: identifier.replace(/\D/g, "")

			const { data } = await server.post("/login/acai", {
				identifier: normalizedIdentifier,
				password,
			})
			console.log(data)

			if (data?.user && data?.token) {
				console.log("Login bem-sucedido:", data.user)
				await Promise.all([storageUserSave(data.user), storageAuthTokenSave(data.token)])
				applyAuthHeader(data.token)
				setUser(data.user)
				// const token = (await ensureRegistered()) ?? pushToken
				// await server.post("/device/register", { token, platform: "android" })
			}
		} finally {
			setAuthSubmitting(false)
		}
	}

	async function signOut() {
		setAuthSubmitting(true)
		try {
			await Promise.all([storageUserRemove(), storageAuthTokenRemove()])
			applyAuthHeader(null)
			setUser(null)
		} finally {
			setAuthSubmitting(false)
		}
	}

	async function loadUserData() {
		setIsBootstrapping(true)
		try {
			const [userLogged, token] = await Promise.all([storageUserGet(), storageAuthTokenGet()])
			if (userLogged && token) {
				applyAuthHeader(token)
				setUser(userLogged)
			} else {
				applyAuthHeader(null)
				setUser(null)
			}
		} finally {
			setIsBootstrapping(false)
		}
	}

	useEffect(() => {
		loadUserData()
	}, [])

	const value = useMemo(
		() => ({ user, isBootstrapping, authSubmitting, signIn, signOut }),
		[user, isBootstrapping, authSubmitting],
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
