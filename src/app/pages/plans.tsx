import { Header } from "@/components/Header"
import { useAuth } from "@/hooks/useAuth"
import { Plan, plansApi } from "@/server/plans"
import axios from "axios"
import { useRouter } from "expo-router"
import {
	BarChart3,
	Check,
	Crown,
	Gem,
	Map,
	Megaphone,
	ShieldCheck,
	Sparkles,
	Users,
	Zap,
} from "lucide-react-native"
import React, { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from "react-native"
import Toast from "react-native-toast-message"

const featureLabels: Array<[keyof Plan["features"], string]> = [
	["has_basic_chat", "Chat básico"],
	["has_simple_route", "Rota simplificada"],
	["has_price_history", "Histórico de preços"],
	["has_price_alerts", "Alertas de preços"],
	["has_premium_map", "Mapa premium"],
	["has_advanced_filters", "Filtros avançados"],
	["has_reports", "Relatórios"],
	["has_comparisons", "Comparativos regionais"],
	["has_performance_metrics", "Painel de desempenho"],
	["has_territorial_dashboard", "Dashboard territorial"],
	["has_data_export", "Exportação de dados"],
	["has_multiple_users", "Múltiplos usuários"],
]

function planFeatures(plan: Plan) {
	const features = featureLabels.filter(([key]) => plan.features[key]).map(([, label]) => label)
	if (plan.offer_limit !== null) features.unshift(`Até ${plan.offer_limit} ofertas`)
	return features.slice(0, 4)
}

function planPrice(plan: Plan) {
	return plan.monthly_price === 0
		? "Grátis"
		: `${plan.monthly_price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/mês`
}

function apiMessage(error: unknown) {
	if (axios.isAxiosError(error)) {
		return error.response?.data?.message ?? "Não foi possível concluir a operação."
	}
	return "Não foi possível concluir a operação."
}

export default function PlansScreen() {
	const router = useRouter()
	const { user } = useAuth()
	const currentPlanId = user?.active_subscription?.plan.id ?? null
	const [plans, setPlans] = useState<Plan[]>([])
	const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null)
	const [loading, setLoading] = useState(true)
	const [refreshing, setRefreshing] = useState(false)
	const [subscribing, setSubscribing] = useState(false)

	const loadPlans = useCallback(async (refresh = false) => {
		refresh ? setRefreshing(true) : setLoading(true)
		try {
			const availablePlans = await plansApi.list()
			setPlans(availablePlans)
			setSelectedPlanId((current) =>
				availablePlans.some((plan) => plan.id === current)
					? current
					: (availablePlans.find((plan) => plan.id === currentPlanId) ??
						availablePlans.find((plan) => plan.slug === "pro") ??
						availablePlans[0])?.id ?? null,
			)
		} catch (error) {
			Toast.show({ type: "error", text1: "Erro ao carregar planos", text2: apiMessage(error) })
		} finally {
			setLoading(false)
			setRefreshing(false)
		}
	}, [currentPlanId])

	useEffect(() => {
		loadPlans()
	}, [loadPlans])

	const selected = plans.find((plan) => plan.id === selectedPlanId)
	const isCurrentPlanSelected = selected?.id === currentPlanId

	async function subscribe(plan: Plan | undefined) {
		if (!plan || subscribing) return
		setSubscribing(true)
		try {
			await plansApi.subscribe(
				plan,
				plan.monthly_price > 0
					? { stripe_subscription_id: "sub_app_test_123", stripe_customer_id: "cus_app_test_123" }
					: undefined,
			)
			Toast.show({ type: "success", text1: "Plano assinado", text2: `O plano ${plan.name} foi ativado com sucesso.` })
			router.replace("/(tabs)/user")
		} catch (error) {
			Toast.show({ type: "error", text1: "Erro na assinatura", text2: apiMessage(error) })
		} finally {
			setSubscribing(false)
		}
	}

	return (
		<View className="flex-1 bg-white">
			<Header
				title="Planos"
				subtitle="Mais inteligência, menos anúncios"
				showBack
				rightAction={<View className="h-9 w-9 items-center justify-center rounded-full bg-white/20"><Gem size={18} color="#FFFFFF" /></View>}
			/>
			<ScrollView
				className="flex-1"
				contentContainerClassName="px-5 pt-6 pb-8"
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadPlans(true)} />}
			>
				<Text className="text-3xl font-extrabold text-purple-900 text-center">
					Escolha seu plano
				</Text>

				{loading ? (
					<View className="h-48 items-center justify-center"><ActivityIndicator size="large" color="#512B76" /></View>
				) : plans.length === 0 ? (
					<View className="rounded-2xl border border-purple-100 bg-purple-50 p-6"><Text className="text-center text-purple-900 font-bold">Nenhum plano disponível no momento.</Text></View>
				) : <View className="gap-3">
					{plans.map((plan) => {
						const isSelected = selectedPlanId === plan.id
						const isCurrentPlan = currentPlanId === plan.id
						const isGreen = plan.slug === "pro"
						const Icon = plan.monthly_price === 0 ? Megaphone : plan.features.has_territorial_dashboard ? Users : plan.features.has_reports ? BarChart3 : Zap
						const features = planFeatures(plan)

						return (
							<Pressable
								key={plan.id}
								onPress={() => setSelectedPlanId(plan.id)}
								className={`rounded-2xl border p-4 overflow-hidden ${
									isSelected
										? "border-green-500 bg-green-50"
										: "border-purple-100 bg-white"
								}`}
							>
								<View className="absolute right-2 bottom-1 opacity-10">
									{plan.features.has_territorial_dashboard ? (
										<Map size={105} color="#512B76" />
									) : plan.features.has_reports ? (
										<BarChart3 size={105} color="#512B76" />
									) : (
										<Sparkles
											size={105}
											color={isGreen ? "#15803d" : "#512B76"}
										/>
									)}
								</View>

								<View className="flex-row justify-between items-start">
									<View className="flex-row gap-3 flex-1">
										<View
											className={`w-11 h-11 rounded-full items-center justify-center ${
												isGreen ? "bg-green-600" : "bg-purple-200"
											}`}
										>
											<Icon size={22} color={isGreen ? "#fff" : "#512B76"} />
										</View>

										<View className="flex-1">
											<Text
												className={`font-extrabold text-lg ${
													isGreen ? "text-green-800" : "text-purple-900"
												}`}
											>
												{plan.name}
											</Text>

											<Text
												className={`font-bold text-sm ${
													isGreen ? "text-green-700" : "text-purple-800"
												}`}
											>
												{planPrice(plan)}
											</Text>
										</View>
									</View>

									<View
										className={`px-2.5 py-1 rounded-full ${
											isGreen ? "bg-green-600" : "bg-purple-100"
										}`}
									>
										<Text
											className={`text-[10px] font-bold ${
												isGreen ? "text-white" : "text-purple-700"
											}`}
										>
											{isCurrentPlan ? "Plano atual" : plan.monthly_price === 0 ? "Gratuito" : isGreen ? "Mais popular" : "Premium"}
										</Text>
									</View>
								</View>

								<View className="mt-3 gap-1.5">
									{features.map((feature) => (
										<View key={feature} className="flex-row items-center gap-2">
											<ShieldCheck
												size={13}
												color={isGreen ? "#15803d" : "#512B76"}
											/>
											<Text className="text-gray-700 text-xs">{feature}</Text>
										</View>
									))}
								</View>

								<View className="absolute right-4 top-1/2">
									<View
										className={`w-6 h-6 rounded-full border items-center justify-center ${
											isSelected
												? "bg-green-600 border-green-600"
												: "border-gray-300 bg-white"
										}`}
									>
										{isSelected && <Check size={15} color="#fff" />}
									</View>
								</View>
							</Pressable>
						)
					})}
				</View>}

				<View className="mt-4 rounded-2xl bg-purple-50 border border-purple-100 p-4 flex-row gap-3">
					<View className="w-8 h-8 rounded-full bg-white items-center justify-center">
						<Text className="text-purple-700 font-bold">i</Text>
					</View>

					<Text className="text-purple-800 text-xs flex-1 leading-5">
						No módulo grátis: sem anúncios em chat, pagamento, rota, confirmação e
						avaliação.
					</Text>
				</View>

				<Pressable
					onPress={() => subscribe(selected)}
					disabled={!selected || subscribing || isCurrentPlanSelected}
					className={`mt-5 rounded-xl h-14 items-center justify-center flex-row gap-2 ${!selected || subscribing || isCurrentPlanSelected ? "bg-gray-400" : "bg-green-700"}`}
				>
					{subscribing ? <ActivityIndicator color="#fff" /> : <Crown size={18} color="#fff" />}
					<Text className="text-white font-extrabold text-base">
						{subscribing ? "Assinando..." : isCurrentPlanSelected ? "Seu plano atual" : `Assinar ${selected?.name ?? "plano"}`}
					</Text>
				</Pressable>

				<Pressable className="mt-4 items-center" disabled={subscribing || currentPlanId === plans.find((plan) => plan.monthly_price === 0)?.id} onPress={() => subscribe(plans.find((plan) => plan.monthly_price === 0))}>
					<Text className="text-purple-800 font-bold">Continuar no plano gratuito ›</Text>
				</Pressable>

				<Text className="text-gray-400 text-[11px] text-center mt-3">
					Pagamento seguro. Cancele quando quiser.
				</Text>
			</ScrollView>
		</View>
	)
}
