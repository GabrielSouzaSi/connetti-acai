// _layout.tsx
import { AuthContextProvider } from "@/contexts/AuthContext"
import { useAuth } from "@/hooks/useAuth"
import "@/styles/global.css"
import { Stack, useRootNavigationState, useRouter } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

function RootLayoutNav() {
	const { user, isBootstrapping } = useAuth()
	const nav = useRootNavigationState()
	// const { success, error } = useMigrations(db, migrations)
	// useDrizzleStudio(expoDb)
	const router = useRouter()
	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	// useEffect(() => {
	// 	if (error) throw error
	// }, [error])

	// Esconde o Splash quando router e boot estiverem prontos
	useEffect(() => {
		// if (!isFontLoaded) return
		if (!nav?.key) return
		if (isBootstrapping) return
		SplashScreen.hideAsync().catch(() => {})
	}, [nav?.key, isBootstrapping])

	// Durante o boot inicial, deixe o Splash cuidar da tela
	if (!nav?.key || isBootstrapping) return null

	const isLoggedIn = !!user?.id

	return (
		<SafeAreaProvider>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Protected guard={!isLoggedIn}>
					<Stack.Screen name="index" />
					<Stack.Screen name="auth/register" />
				</Stack.Protected>

				<Stack.Protected guard={isLoggedIn}>
					<Stack.Screen name="(tabs)" />
					<Stack.Screen name="pages" />
				</Stack.Protected>
			</Stack>
		</SafeAreaProvider>
	)
}

export default function RootLayout() {
	return (
		<AuthContextProvider>
			<RootLayoutNav />
		</AuthContextProvider>
	)
}
