import { Tabs } from "expo-router"
import { Handshake, Home, Tag, User } from "lucide-react-native"
import React from "react"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const COLORS = {
	activeTint: "#512B76",
	inactiveTint: "#000",
}

export default function TabLayout() {
	const insets = useSafeAreaInsets()

	return (
		<Tabs
			screenOptions={{
				// Oculta o cabeçalho nativo da tela
				headerShown: false,

				tabBarStyle: {
					backgroundColor: "white",
					borderTopWidth: 1,
					borderTopColor: "#E5E7EB",
					elevation: 0,
					shadowOpacity: 0,
					height: 58 + insets.bottom,
					paddingBottom: insets.bottom,
					paddingTop: 6,
				},
				tabBarLabelStyle: {
					fontSize: 14,
					fontWeight: "600",
					marginBottom: 4,
				},

				tabBarActiveTintColor: COLORS.activeTint,
				tabBarInactiveTintColor: COLORS.inactiveTint,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Início",
					tabBarIcon: ({ color }) => <Home size={28} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="sale"
				options={{
					title: "Ofertas",
					tabBarIcon: ({ color }) => (
						<Tag
							size={28}
							color={color}
							style={{ transform: [{ rotate: "90deg" }] }}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="transaction"
				options={{
					title: "Negociações",
					tabBarIcon: ({ color }) => <Handshake size={28} color={color} />,
				}}
			/>
			<Tabs.Screen
				name="message"
				options={{
					href: null,
				}}
			/>
			<Tabs.Screen
				name="user"
				options={{
					title: "Perfil",
					tabBarIcon: ({ color }) => <User size={28} color={color} />,
				}}
			/>
		</Tabs>
	)
}
