import { Feature } from "@/auth/accessControl"
import { Header } from "@/components/Header"
import { Profile } from "@/components/Profile"
import { useAccess } from "@/hooks/useAccess"
import { useAuth } from "@/hooks/useAuth"
import { router, type Href } from "expo-router"
import {
	Bell,
	ChevronRight,
	CreditCard,
	HelpCircle,
	LogOut,
	MessageCircle,
	ShieldCheck,
	Tag,
	User,
} from "lucide-react-native"
import React from "react"
import { Pressable, ScrollView, Text, View } from "react-native"

type MenuOption = {
	title: string
	description: string
	icon: typeof User
	route?:
		| "/pages/myOffers"
		| "/pages/plans"
		| "/pages/chat"
		| "/pages/personalData"
		| "/pages/verification"
		| "/pages/notificationSettings"
		| "/pages/helpSupport"
	access?: Feature
}

const options: readonly MenuOption[] = [
	{
		title: "Dados pessoais",
		description: "Nome, telefone e informações da conta",
		icon: User,
		route: "/pages/personalData",
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
		route: "/pages/verification",
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
		route: "/pages/notificationSettings",
	},
	{
		title: "Ajuda e suporte",
		description: "Central de atendimento",
		icon: HelpCircle,
		route: "/pages/helpSupport",
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
	const activeSubscription = user?.active_subscription ?? null

	return (
		<View className="flex-1 bg-white">
			<Header title="Perfil" subtitle="Conta e preferências" />
			<ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-gray-50">
				<Profile plan assessment />

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
											router.push(item.route as Href)
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
											{item.title === "Planos"
												? activeSubscription
													? `Plano atual: ${activeSubscription.plan.name}`
													: "Sem plano ativo"
												: item.description}
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
