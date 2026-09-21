import { isAdmin, type Profile } from "@/auth/accessControl"
// contexts/AuthContext.tsx
import { LoginResponseDTO, UserDTO } from "@/dtos/userDTO"
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
	activeProfile: Profile | null
	selectProfile: (profile: Profile) => void
	isBootstrapping: boolean // <— só no boot
	authSubmitting: boolean // <— login/logout em andamento
	signIn: (identifier: string, password: string) => Promise<void>
	signOut: () => Promise<void>
}

type AuthContextProviderProps = { children: ReactNode }

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps)

export function AuthContextProvider({ children }: AuthContextProviderProps) {
	const [user, setUser] = useState<UserDTO | null>(null)
	const [activeProfile, setActiveProfile] = useState<Profile | null>(null)
	function selectProfile(profile: Profile) {
		if (isAdmin(user) && (profile === "buyer" || profile === "producer")) setActiveProfile(profile)
	}
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
			let normalizedIdentifier = identifier.includes("@")
				? identifier.trim().toLowerCase()
				: identifier.replace(/\D/g, "")

			if (!identifier.includes("@") && (normalizedIdentifier.length === 10 || normalizedIdentifier.length === 11)) {
				normalizedIdentifier = `55${normalizedIdentifier}`
			}

			const { data } = await server.post<LoginResponseDTO>("/login", {
				identifier: normalizedIdentifier,
				password,
			})
			if (data.user && data.token) {
				await Promise.all([storageUserSave(data.user), storageAuthTokenSave(data.token)])
				applyAuthHeader(data.token)
				setActiveProfile(null)
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
			setActiveProfile(null)
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
				setActiveProfile(null)
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
		() => ({ user, activeProfile, selectProfile, isBootstrapping, authSubmitting, signIn, signOut }),
		[user, activeProfile, isBootstrapping, authSubmitting],
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
