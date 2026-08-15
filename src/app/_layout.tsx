// _layout.tsx
import { CustomToast } from "@/components/CustomToast"
import { AuthContextProvider } from "@/contexts/AuthContext"
import { useAuth } from "@/hooks/useAuth"
import { useNegotiationNotifications } from "@/hooks/useNegotiationNotifications"
import { configureNotifications } from "@/services/notifications"
import "@/styles/global.css"
import * as Notifications from "expo-notifications"
import { Href, Stack, useRootNavigationState, useRouter } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useEffect } from "react"
import { SafeAreaProvider } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

function RootLayoutNav() {
	const { user, isBootstrapping } = useAuth()
	const nav = useRootNavigationState()
	// const { success, error } = useMigrations(db, migrations)
	// useDrizzleStudio(expoDb)
	const router = useRouter()
	useNegotiationNotifications(user?.id)
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

	useEffect(() => {
		configureNotifications().catch(console.error)
	}, [])

	useEffect(() => {
		if (!nav?.key || isBootstrapping) return

		function redirect(notification: Notifications.Notification) {
			const url = notification.request.content.data?.url

			if (typeof url === "string" && url.startsWith("/")) {
				router.push(url as Href)
			}
		}

		const lastResponse = Notifications.getLastNotificationResponse()

		if (lastResponse?.notification) {
			redirect(lastResponse.notification)
		}

		const subscription =
			Notifications.addNotificationResponseReceivedListener((response) => {
				redirect(response.notification)
			})

		return () => subscription.remove()
	}, [isBootstrapping, nav?.key, router])

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
			<Toast
				config={{
					success: (props) => <CustomToast {...props} type="success" />,
					error: (props) => <CustomToast {...props} type="error" />,
					info: (props) => <CustomToast {...props} type="info" />,
				}}
			/>
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
