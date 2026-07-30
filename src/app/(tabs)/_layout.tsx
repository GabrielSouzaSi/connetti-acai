import { useAuth } from "@/hooks/useAuth"
import { Tabs } from "expo-router"
import { Handshake, Home, MessageCircle, Tag, User } from "lucide-react-native"
import React from "react"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const COLORS = {
	background: "#111827", // Um cinza bem escuro (gray-900)
	activeTint: "#512B76", // Um verde de destaque (green-400)
	inactiveTint: "#000", // Um cinza mais claro (gray-400)
}

export default function TabLayout() {
	const insets = useSafeAreaInsets()
	const { user } = useAuth()
	console.log(user)

	return (
		<Tabs
			screenOptions={{
				// Oculta o cabeçalho nativo da tela
				headerShown: false,

				// 1. FUNDO DA TAB BAR: Torna a Tab Bar nativa invisível
				tabBarStyle: {
					backgroundColor: "white", // Fundo transparente
					borderTopWidth: 1, // Remove a borda superior da Tab Bar
					elevation: 0, // Remove a sombra no Android
					shadowOpacity: 0, // Remove a sombra no iOS
					position: "absolute", // Garante que a Tab Bar fique sobreposta ao conteúdo
					bottom: 8,
					left: 0,
					right: 0,
					height: 50 + insets.bottom, // Altura personalizada para a Tab Bar
					paddingBottom: insets.bottom, // Adiciona o espaço do Safe Area e um pouco mais
					paddingTop: 10,
				},
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: "400",
					marginBottom: 5, // Ajusta o espaçamento entre o ícone e o rótulo
				},

				// 2. CONFIGURAÇÃO DE ÍCONES/LABEL: Define cores base
				tabBarActiveTintColor: COLORS.activeTint, // Roxo de destaque (para os ícones laterais)
				tabBarInactiveTintColor: COLORS.inactiveTint, // Cinza claro (para os ícones laterais)
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Início",
					tabBarIcon: ({ color }) => <Home size={28} color={"#000"} />,
				}}
			/>
			<Tabs.Screen
				name="sale"
				options={{
					title: "Ofertas",
					tabBarIcon: ({ color }) => (
						<Tag
							size={28}
							color={"#000"}
							style={{ transform: [{ rotate: "90deg" }] }}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="transaction"
				options={{
					title: "Negociações",
					tabBarIcon: ({ color }) => <Handshake size={28} color={"#000"} />,
				}}
			/>
			<Tabs.Screen
				name="message"
				options={{
					title: "Mensagens",
					tabBarIcon: ({ color }) => <MessageCircle size={28} color={"#000"} />,
				}}
			/>
			<Tabs.Screen
				name="user"
				options={{
					title: "Perfil",
					tabBarIcon: ({ color }) => <User size={28} color={"#000"} />,
				}}
			/>
		</Tabs>
	)
}
