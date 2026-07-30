import { useAuth } from "@/hooks/useAuth"
import {
	ArrowLeft,
	CalendarDays,
	ChevronDown,
	ChevronRight,
	Filter,
	MapPin,
	TrendingDown,
	TrendingUp,
} from "lucide-react-native"
import { Pressable, ScrollView, StatusBar, Text, View } from "react-native"
import { LineChart } from "react-native-gifted-charts"
import { SafeAreaView } from "react-native-safe-area-context"

function FilterButton({ icon, title }: { icon: React.ReactNode; title: string }) {
	return (
		<Pressable className="h-12 flex-row items-center justify-between rounded-xl border border-zinc-200 bg-white px-3">
			<View className="flex-row items-center gap-2">
				{icon}

				<Text className="text-sm font-medium text-zinc-800">{title}</Text>
			</View>

			<ChevronDown size={18} color="#4c1d95" />
		</Pressable>
	)
}

export default function PageProducerHomeScreen() {
	const { signOut } = useAuth()
	const priceHistory = [
		{ date: "22/05/2025", price: "4,35", variation: "2,3%", type: "up" },
		{ date: "21/05/2025", price: "4,25", variation: "1,2%", type: "up" },
		{ date: "20/05/2025", price: "4,20", variation: "-0,8%", type: "down" },
		{ date: "19/05/2025", price: "4,23", variation: "0,5%", type: "up" },
		{ date: "18/05/2025", price: "4,21", variation: "1,0%", type: "up" },
		{ date: "17/05/2025", price: "4,17", variation: "1,7%", type: "up" },
		{ date: "16/05/2025", price: "4,10", variation: "0,7%", type: "up" },
	]

	const chartData = [
		{ value: 3.9, label: "16/05" },
		{ value: 4.08, label: "17/05" },
		{ value: 4.35, label: "18/05" },
		{ value: 4.28, label: "19/05" },
		{ value: 4.42, label: "20/05" },
		{ value: 4.38, label: "21/05" },
		{ value: 4.75, label: "22/05" },
	]

	return (
		<View style={{ flex: 1, backgroundColor: "#fff" }}>
			<StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

			<SafeAreaView edges={["top"]} style={{ backgroundColor: "#512B76" }} />
			<View className="flex-1 bg-zinc-50">
				<View className="flex-row items-center justify-between px-5 pb-4 bg-white">
					<Pressable onPress={() => signOut()}>
						<ArrowLeft size={24} color="#4c1d95" />
					</Pressable>

					<Text className="text-lg font-bold text-zinc-900">Painel de preços</Text>

					<Filter size={22} color="#4c1d95" />
				</View>

				<ScrollView
					className="flex-1"
					contentContainerClassName="px-4 pb-8"
					contentContainerStyle={{ paddingBottom: 100 }}
					showsVerticalScrollIndicator={false}
				>
					<View className="flex-row gap-3 mt-4">
						<View className="flex-1 gap-2">
							<Text className="text-sm font-medium text-zinc-600">Município</Text>

							<FilterButton
								icon={<MapPin size={18} color="#6b21a8" />}
								title="Belém - PA"
							/>
						</View>

						<View className="flex-1 gap-2">
							<Text className="text-sm font-medium text-zinc-600">Período</Text>

							<FilterButton
								icon={<CalendarDays size={18} color="#6b21a8" />}
								title="7 dias"
							/>
						</View>
					</View>

					<View className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4">
						<Text className="text-lg font-bold text-zinc-900">
							Evolução do preço (R$/kg)
						</Text>

						<View className="mt-5 flex-row items-start justify-between">
							<View className="flex-row items-end">
								<Text className="text-3xl font-bold text-purple-900">R$ 4,35</Text>

								<Text className="mb-1 ml-1 text-sm font-medium text-zinc-600">
									/kg
								</Text>
							</View>

							<View className="items-end">
								<View className="flex-row items-center gap-1 rounded-full bg-green-50 px-3 py-1">
									<TrendingUp size={14} color="#16a34a" />

									<Text className="text-sm font-bold text-green-600">2,3%</Text>
								</View>

								<Text className="mt-1 text-xs text-green-600">
									Comparado a 7 dias
								</Text>
							</View>
						</View>

						<View className="mt-4">
							<LineChart
								data={chartData}
								height={180}
								spacing={42}
								initialSpacing={0}
								color="#5b21b6"
								thickness={3}
								hideDataPoints={false}
								dataPointsColor="#5b21b6"
								dataPointsRadius={4}
								startFillColor="#7e22ce"
								endFillColor="#ffffff"
								startOpacity={0.25}
								endOpacity={0.02}
								areaChart
								yAxisTextStyle={{
									color: "#71717a",
									fontSize: 10,
								}}
								xAxisLabelTextStyle={{
									color: "#71717a",
									fontSize: 10,
								}}
								yAxisColor="transparent"
								xAxisColor="#e4e4e7"
								rulesColor="#f4f4f5"
								noOfSections={4}
								maxValue={5}
								stepValue={0.5}
							/>
						</View>

						<View className="mt-3 flex-row justify-between">
							<Text className="text-xs text-zinc-400">Fonte: Connetti Açaí</Text>

							<Text className="text-xs text-zinc-400">
								Atualizado em 22/05 às 08:30
							</Text>
						</View>
					</View>

					<View className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4">
						<Text className="text-lg font-bold text-zinc-900">Histórico de preços</Text>

						<View className="mt-5 flex-row border-b border-zinc-100 pb-3">
							<Text className="flex-1 text-sm font-semibold text-zinc-600">Data</Text>

							<Text className="flex-1 text-center text-sm font-semibold text-zinc-600">
								Preço médio (R$/kg)
							</Text>

							<Text className="flex-1 text-right text-sm font-semibold text-zinc-600">
								Variação
							</Text>
						</View>

						{priceHistory.map((item) => (
							<View
								key={item.date}
								className="flex-row items-center border-b border-zinc-100 py-3"
							>
								<Text className="flex-1 text-sm text-zinc-700">{item.date}</Text>

								<Text className="flex-1 text-center text-sm font-medium text-zinc-800">
									{item.price}
								</Text>

								<View className="flex-1 flex-row items-center justify-end gap-1">
									{item.type === "up" ? (
										<TrendingUp size={14} color="#16a34a" />
									) : (
										<TrendingDown size={14} color="#ef4444" />
									)}

									<Text
										className={
											item.type === "up"
												? "text-sm font-bold text-green-600"
												: "text-sm font-bold text-red-500"
										}
									>
										{item.variation}
									</Text>
								</View>
							</View>
						))}

						<Pressable className="mt-4 flex-row items-center justify-center gap-2">
							<Text className="text-sm font-bold text-purple-900">Ver histórico</Text>

							<ChevronRight size={16} color="#4c1d95" />
						</Pressable>
					</View>
				</ScrollView>
			</View>
		</View>
	)
}
