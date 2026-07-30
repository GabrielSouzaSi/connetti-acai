import { useAuth } from "@/hooks/useAuth"
import { router } from "expo-router"
import {
	BadgeCheck,
	Bell,
	ChevronRight,
	CreditCard,
	HelpCircle,
	MapPin,
	ShieldCheck,
	Star,
	Tag,
	User,
} from "lucide-react-native"
import React from "react"
import { Image, Pressable, ScrollView, StatusBar, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const options: any[] = [
	{
		title: "Gabriel Souza",
		description: "Nome, telefone e informações da conta",
		icon: User,
		route: "/pages/negotiation",
	},
	{
		title: "Luana Silva",
		description: "Gerencie suas ofertas ativas e histórico",
		icon: Tag,
		route: "/pages/negotiation",
	},
	{
		title: "João Pereira",
		description: "Documentos e conta verificada",
		icon: ShieldCheck,
		route: "/pages/negotiation",
	},
	{
		title: "Carla Santos",
		description: "Gerencie seus planos de assinatura",
		icon: CreditCard,
		route: "/pages/plans",
	},
	{
		title: "Felipe Oliveira",
		description: "Preferências de avisos",
		icon: Bell,
		route: "/pages/negotiation",
	},
	{
		title: "Maria Fernandes",
		description: "Central de atendimento",
		icon: HelpCircle,
		route: "/pages/negotiation",
	},
]

export default function TabMessageScreen() {
	const { user } = useAuth()
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
								<Text className="text-gray-500 ml-1">Abaetetuba - PA</Text>
							</View>

							<View className="flex-row items-center mt-1">
								<BadgeCheck size={16} color="#22C55E" />
								<Text className="text-green-600 ml-1 font-medium">
									Vendedor verificado
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
						{options.map((item, index) => {
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
										index !== options.length - 1
											? "border-b border-gray-100"
											: ""
									}`}
								>
									<View className="w-11 h-11 rounded-full bg-purple-100 items-center justify-center mr-4">
										<Image
											source={{
												uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
											}}
											className="w-11 h-11 rounded-full"
										/>
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
				</View>
			</ScrollView>
		</View>
	)
}
