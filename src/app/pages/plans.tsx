import { router } from "expo-router"
import {
	ArrowLeft,
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
import React, { useState } from "react"
import { Pressable, ScrollView, Text, View } from "react-native"

const plans = [
	{
		id: "free",
		name: "Gratuito",
		price: "R$ 0/mês",
		tag: "Patrocinado",
		color: "purple",
		icon: Megaphone,
		features: [
			"Publicidade controlada",
			"Consulta básica",
			"Alertas anônimos por município",
			"1ª propaganda após 5 interações",
		],
	},
	{
		id: "pro",
		name: "Pro",
		price: "R$ 39,90/mês",
		tag: "Mais popular",
		color: "green",
		icon: Zap,
		features: [
			"Sem anúncios",
			"Alertas com identificação do cliente",
			"Histórico completo",
			"Filtros avançados",
		],
	},
	{
		id: "plus",
		name: "Plus",
		price: "R$ 89,90/mês",
		tag: "Performance",
		color: "purple",
		icon: BarChart3,
		features: ["Sem anúncios", "Relatórios", "Comparativos regionais", "Painel de desempenho"],
	},
	{
		id: "institutional",
		name: "Institucional",
		price: "A partir de R$ 499/mês",
		tag: "Gestão territorial",
		color: "purple",
		icon: Users,
		features: [
			"Sem anúncios",
			"Dashboard territorial",
			"Exportação de relatórios",
			"Múltiplos usuários",
		],
	},
]

export default function PlansScreen() {
	const [selectedPlan, setSelectedPlan] = useState("pro")

	const selected = plans.find((plan) => plan.id === selectedPlan)

	return (
		<View className="flex-1 bg-white">
			<ScrollView
				className="flex-1"
				contentContainerClassName="px-5 pt-12 pb-8"
				showsVerticalScrollIndicator={false}
			>
				<View className="flex-row items-center justify-between mb-3">
					<Pressable onPress={() => router.back()}>
						<ArrowLeft size={24} color="#512B76" />
					</Pressable>

					<View className="flex-row items-center gap-2">
						<View className="w-7 h-7 rounded-full bg-purple-700 items-center justify-center">
							<Gem size={16} color="#fff" />
						</View>

						<Text className="text-purple-800 font-bold text-base">Connetti Açaí</Text>
					</View>

					<View className="w-6" />
				</View>

				<Text className="text-3xl font-extrabold text-purple-900 text-center">
					Escolha seu plano
				</Text>

				<Text className="text-gray-500 text-center mt-1 mb-5">
					Mais inteligência, menos anúncios
				</Text>

				<View className="gap-3">
					{plans.map((plan) => {
						const isSelected = selectedPlan === plan.id
						const Icon = plan.icon
						const isGreen = plan.color === "green"

						return (
							<Pressable
								key={plan.id}
								onPress={() => setSelectedPlan(plan.id)}
								className={`rounded-2xl border p-4 overflow-hidden ${
									isSelected
										? "border-green-500 bg-green-50"
										: "border-purple-100 bg-white"
								}`}
							>
								<View className="absolute right-2 bottom-1 opacity-10">
									{plan.id === "institutional" ? (
										<Map size={105} color="#512B76" />
									) : plan.id === "plus" ? (
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
												{plan.price}
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
											{plan.tag}
										</Text>
									</View>
								</View>

								<View className="mt-3 gap-1.5">
									{plan.features.map((feature) => (
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
				</View>

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
					onPress={() => {
						console.log("Plano selecionado:", selected)
					}}
					className="mt-5 bg-green-700 rounded-xl h-14 items-center justify-center flex-row gap-2"
				>
					<Crown size={18} color="#fff" />
					<Text className="text-white font-extrabold text-base">
						Assinar {selected?.name}
					</Text>
				</Pressable>

				<Pressable className="mt-4 items-center">
					<Text className="text-purple-800 font-bold">Continuar no plano gratuito ›</Text>
				</Pressable>

				<Text className="text-gray-400 text-[11px] text-center mt-3">
					Pagamento seguro. Cancele quando quiser.
				</Text>
			</ScrollView>
		</View>
	)
}
