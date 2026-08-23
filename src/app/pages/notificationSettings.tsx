import AsyncStorage from "@react-native-async-storage/async-storage"
import { Header } from "@/components/Header"
import { Bell, Handshake, MessageCircle, Tag } from "lucide-react-native"
import { useEffect, useState } from "react"
import { ScrollView, Switch, Text, View } from "react-native"

const STORAGE_KEY = "@connetti-acai:notification-preferences"
const defaults = { offers: true, negotiations: true, messages: true }
type Preferences = typeof defaults

export default function NotificationSettingsScreen() {
	const [preferences, setPreferences] = useState<Preferences>(defaults)

	useEffect(() => {
		AsyncStorage.getItem(STORAGE_KEY)
			.then((stored) => {
				if (stored) setPreferences({ ...defaults, ...JSON.parse(stored) })
			})
			.catch(() => {})
	}, [])

	function toggle(key: keyof Preferences) {
		setPreferences((current) => {
			const next = { ...current, [key]: !current[key] }
			AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {})
			return next
		})
	}

	const options = [
		{
			key: "offers" as const,
			icon: Tag,
			title: "Ofertas",
			description: "Novas ofertas e mudanças de preço",
		},
		{
			key: "negotiations" as const,
			icon: Handshake,
			title: "Negociações",
			description: "Propostas, respostas e atualizações",
		},
		{
			key: "messages" as const,
			icon: MessageCircle,
			title: "Mensagens",
			description: "Novas mensagens nas suas conversas",
		},
	]

	return (
		<View className="flex-1 bg-gray-50">
			<Header title="Notificações" subtitle="Escolha os avisos que deseja receber" showBack />
			<ScrollView contentContainerClassName="p-5 pb-10" showsVerticalScrollIndicator={false}>
				<View className="mb-5 flex-row items-center rounded-2xl border border-purple-100 bg-purple-50 p-4">
					<Bell size={24} color="#512B76" />
					<Text className="ml-3 flex-1 leading-5 text-purple-800">
						Suas preferências ficam salvas neste dispositivo.
					</Text>
				</View>
				<View className="overflow-hidden rounded-2xl bg-white">
					{options.map(({ key, icon: Icon, title, description }, index) => (
						<View
							key={key}
							className={`flex-row items-center p-4 ${index < options.length - 1 ? "border-b border-gray-100" : ""}`}
						>
							<View className="mr-4 h-11 w-11 items-center justify-center rounded-full bg-purple-100">
								<Icon size={22} color="#512B76" />
							</View>
							<View className="mr-3 flex-1">
								<Text className="font-semibold text-gray-900">{title}</Text>
								<Text className="mt-0.5 text-sm text-gray-500">{description}</Text>
							</View>
							<Switch
								value={preferences[key]}
								onValueChange={() => toggle(key)}
								trackColor={{ false: "#D1D5DB", true: "#A78BFA" }}
								thumbColor={preferences[key] ? "#512B76" : "#F9FAFB"}
							/>
						</View>
					))}
				</View>
			</ScrollView>
		</View>
	)
}
