import { Feature } from "@/auth/accessControl"
import { useAuth } from "@/hooks/useAuth"
import { useAccess } from "@/hooks/useAccess"
import { router } from "expo-router"
import {
	BadgeCheck,
	Bell,
	ChevronRight,
	CreditCard,
	HelpCircle,
	LogOut,
	MapPin,
	MessageCircle,
	ShieldCheck,
	Star,
	Tag,
	User,
} from "lucide-react-native"
import React from "react"
import { Image, Pressable, ScrollView, StatusBar, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type MenuOption = {
	title: string
	description: string
	icon: typeof User
	route?: "/pages/myOffers" | "/pages/plans" | "/pages/chat"
	access?: Feature
}

const options: readonly MenuOption[] = [
	{
		title: "Dados pessoais",
		description: "Nome, telefone e informações da conta",
		icon: User,
	},
	{
		title: "Minhas ofertas",
		description: "Gerencie suas ofertas ativas e histórico",
		icon: Tag,
		route: "/pages/myOffers",
		access: "manageOffers" as const,
	},
	{
		title: "Verificação",
		description: "Documentos e conta verificada",
		icon: ShieldCheck,
	},
	{
		title: "Planos",
		description: "Gerencie seus planos de assinatura",
		icon: CreditCard,
		route: "/pages/plans",
	},
	{
		title: "Notificações",
		description: "Preferências de avisos",
		icon: Bell,
	},
	{
		title: "Ajuda e suporte",
		description: "Central de atendimento",
		icon: HelpCircle,
	},
	{
		title: "Chat com suporte",
		description: "Fale com a equipe",
		icon: MessageCircle,
		route: "/pages/chat",
	},
]

export default function TabUserScreen() {
	const { user, signOut } = useAuth()
	const { canAccess } = useAccess()
	const visibleOptions = options.filter((option) => !option.access || canAccess(option.access))

	return (
		<View className="flex-1 bg-white">
			<StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

			<SafeAreaView edges={["top"]} style={{ backgroundColor: "#512B76" }} />
			<ScrollView className="flex-1 bg-gray-50">
				<View className="px-5 pt-12 pb-6 bg-white">
					<View className="flex-row items-center gap-4">
						<Image
							source={{
								uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
							}}
							className="w-20 h-20 rounded-full"
						/>

						<View className="flex-1">
							<Text className="text-xl font-bold text-gray-900">{user?.name}</Text>

							<View className="flex-row items-center mt-1">
								<MapPin size={16} color="#6B7280" />
								<Text className="text-gray-500 ml-1">
									{user?.municipality
										? `${user.municipality.name} - ${user.municipality.state}`
										: user?.community}
								</Text>
							</View>

							<View className="flex-row items-center mt-1">
								<BadgeCheck size={16} color="#22C55E" />
								<Text className="text-green-600 ml-1 font-medium">
									{user?.profile_label ?? "Perfil verificado"}
								</Text>
							</View>
						</View>
					</View>

					<View className="flex-row items-center mt-5">
						{Array.from({ length: 5 }).map((_, index) => (
							<Star
								key={index}
								size={18}
								color="#F59E0B"
								fill="#F59E0B"
								className="mr-1"
							/>
						))}

						<Text className="text-gray-700 ml-2 font-semibold">4,8</Text>
						<Text className="text-gray-500 ml-1">(128 avaliações)</Text>
					</View>
				</View>

				<View className="px-5 mt-5">
					<Text className="text-gray-900 text-lg font-bold mb-3">Minha conta</Text>

					<View className="bg-white rounded-2xl overflow-hidden">
						{visibleOptions.map((item, index) => {
							const Icon = item.icon

							return (
								<Pressable
									key={item.title}
									onPress={() => {
										if (item.route) {
											// Navigate to the specified route
											router.push(item.route)
										}
									}}
									className={`flex-row items-center p-4 ${
										index !== visibleOptions.length - 1
											? "border-b border-gray-100"
											: ""
									}`}
								>
									<View className="w-11 h-11 rounded-full bg-purple-100 items-center justify-center mr-4">
										<Icon size={22} color="#512B76" />
									</View>

									<View className="flex-1">
										<Text className="text-gray-900 font-semibold text-base">
											{item.title}
										</Text>
										<Text className="text-gray-500 text-sm mt-0.5">
											{item.description}
										</Text>
									</View>

									<ChevronRight size={22} color="#9CA3AF" />
								</Pressable>
							)
						})}
					</View>

					<Pressable
						onPress={signOut}
						className="bg-white rounded-2xl p-4 mt-5 flex-row items-center"
					>
						<View className="w-11 h-11 rounded-full bg-red-100 items-center justify-center mr-4">
							<LogOut size={22} color="#EF4444" />
						</View>

						<Text className="flex-1 text-red-500 font-semibold text-base">
							Sair da conta
						</Text>

						<ChevronRight size={22} color="#FCA5A5" />
					</Pressable>
				</View>
			</ScrollView>
		</View>
	)
}
