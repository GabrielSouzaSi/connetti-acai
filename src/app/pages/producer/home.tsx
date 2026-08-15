import { DateSelectionModal } from "@/components/DateSelectionModal"
import { Header } from "@/components/Header"
import { PriceFiltersModal } from "@/components/PriceFiltersModal"
import { MunicipalityAveragePrice, offersApi } from "@/server/offers"
import { formatCurrency, PriceHistoryItem } from "@/utils/priceAnalytics"
import {
	CalendarDays,
	ChevronDown,
	Filter,
	MapPin,
	TrendingDown,
	TrendingUp,
} from "lucide-react-native"
import { useEffect, useMemo, useState } from "react"
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	Text,
	useWindowDimensions,
	View,
} from "react-native"
import { LineChart } from "react-native-gifted-charts"

type DailySnapshot = {
	date: string
	items: MunicipalityAveragePrice[]
}

function municipalityKey(item: MunicipalityAveragePrice) {
	return `${item.municipalityName}${item.state ? ` - ${item.state}` : ""}`
}

function isoDate(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function buildAverageHistory(snapshots: DailySnapshot[], municipality: string) {
	const history: PriceHistoryItem[] = []

	for (const snapshot of snapshots) {
		let price = 0
		let offers = 0

		if (municipality === "all") {
			const available = snapshot.items.filter(
				(item) => (item.offersCount ?? 0) > 0 && Number.isFinite(item.averagePrice),
			)
			offers = available.reduce((sum, item) => sum + (item.offersCount ?? 0), 0)
			if (offers > 0) {
				price =
					available.reduce(
						(sum, item) => sum + item.averagePrice * (item.offersCount ?? 0),
						0,
					) / offers
			}
		} else {
			const selected = snapshot.items.find((item) => municipalityKey(item) === municipality)
			offers = selected?.offersCount ?? 0
			price = selected?.averagePrice ?? 0
		}

		if (offers <= 0 || !Number.isFinite(price)) continue

		history.push({
			isoDate: snapshot.date,
			date: new Date(`${snapshot.date}T12:00:00`).toLocaleDateString("pt-BR"),
			price,
			offers,
			variation: null,
		})
	}

	history.forEach((item, index) => {
		const previous = history[index - 1]
		if (previous && previous.price > 0) {
			item.variation = ((item.price - previous.price) / previous.price) * 100
		}
	})

	return history.reverse()
}

function FilterButton({
	icon,
	title,
	onPress,
}: {
	icon: React.ReactNode
	title: string
	onPress: () => void
}) {
	return (
		<Pressable
			onPress={onPress}
			className="h-12 flex-row items-center justify-between rounded-xl border border-zinc-200 bg-white px-3"
		>
			<View className="flex-1 flex-row items-center gap-2">
				{icon}
				<Text numberOfLines={1} className="flex-1 text-sm font-medium text-zinc-800">
					{title}
				</Text>
			</View>
			<ChevronDown size={18} color="#4c1d95" />
		</Pressable>
	)
}

export default function PageProducerHomeScreen() {
	const { width: windowWidth } = useWindowDimensions()
	const [currentAverages, setCurrentAverages] = useState<MunicipalityAveragePrice[]>([])
	const [snapshots, setSnapshots] = useState<DailySnapshot[]>([])
	const [loading, setLoading] = useState(true)
	const [filterVisible, setFilterVisible] = useState(false)
	const [dateModalVisible, setDateModalVisible] = useState(false)
	const [municipality, setMunicipality] = useState("all")
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [chartWidth, setChartWidth] = useState(Math.max(windowWidth - 64, 280))

	const municipalities = useMemo(
		() => currentAverages.map(municipalityKey).sort(),
		[currentAverages],
	)
	const history = useMemo(
		() => buildAverageHistory(snapshots, municipality),
		[snapshots, municipality],
	)
	const latest = history[0]
	const dateLabel = selectedDate
		? `Data: ${new Date(`${selectedDate}T12:00:00`).toLocaleDateString("pt-BR")}`
		: `Data: ${new Date().toLocaleDateString("pt-BR")}`
	const chartData = [...history].reverse().map((item) => ({
		value: item.price,
		label: item.date.slice(0, 5),
		date: item.date,
	}))
	const chartPlotWidth = Math.max(chartWidth - 35, 1)
	const chartSpacing =
		chartData.length > 1 ? Math.max(64, (chartPlotWidth - 24) / (chartData.length - 1)) : 64

	useEffect(() => {
		let active = true
		setLoading(true)

		offersApi
			.averagePriceByMunicipality(selectedDate ?? undefined)
			.then((averages) => {
				if (!active) return
				setCurrentAverages(averages)
				setSnapshots([
					{
						date: selectedDate ?? averages[0]?.calculationDate ?? isoDate(new Date()),
						items: averages,
					},
				])
			})
			.catch((error) => console.error("Erro ao carregar médias de preços:", error))
			.finally(() => {
				if (active) setLoading(false)
			})

		return () => {
			active = false
		}
	}, [selectedDate])

	return (
		<View className="flex-1 bg-zinc-50">
			<Header
				title="Painel de preços"
				subtitle="Médias oficiais por município"
				rightAction={
					<Pressable
						onPress={() => setFilterVisible(true)}
						accessibilityLabel="Abrir filtros"
					>
						<Filter size={22} color="#FFFFFF" />
					</Pressable>
				}
			/>

			<ScrollView
				className="flex-1"
				contentContainerClassName="px-4 pb-28"
				showsVerticalScrollIndicator={false}
			>
				<View className="mt-4 flex-row gap-3">
					<View className="flex-1 gap-2">
						<Text className="text-sm font-medium text-zinc-600">Município</Text>
						<FilterButton
							icon={<MapPin size={18} color="#6b21a8" />}
							title={municipality === "all" ? "Todos" : municipality}
							onPress={() => setFilterVisible(true)}
						/>
					</View>
					<View className="flex-1 gap-2">
						<Text className="text-sm font-medium text-zinc-600">Data</Text>
						<FilterButton
							icon={<CalendarDays size={18} color="#6b21a8" />}
							title={dateLabel}
							onPress={() => setDateModalVisible(true)}
						/>
					</View>
				</View>

				{loading ? (
					<View className="items-center py-24">
						<ActivityIndicator size="large" color="#5b21b6" />
						<Text className="mt-3 text-zinc-500">Carregando médias históricas...</Text>
					</View>
				) : !latest ? (
					<View className="mt-6 items-center rounded-2xl border border-zinc-200 bg-white px-6 py-16">
						<Text className="text-lg font-bold text-zinc-800">
							Sem médias nesta data
						</Text>
						<Text className="mt-2 text-center text-zinc-500">
							Altere o município ou selecione outra data.
						</Text>
					</View>
				) : (
					<>
						<View className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4">
							<Text className="text-lg font-bold text-zinc-900">
								Evolução do preço médio (R$/kg)
							</Text>
							<View className="mt-5 flex-row items-start justify-between">
								<View className="flex-row items-end">
									<Text className="text-3xl font-bold text-purple-900">
										R$ {formatCurrency(latest.price)}
									</Text>
									<Text className="mb-1 ml-1 text-sm text-zinc-600">/kg</Text>
								</View>
								{latest.variation !== null ? (
									<Variation value={latest.variation} />
								) : null}
							</View>

							{chartData.length > 1 ? (
								<View
									className="mt-4 overflow-hidden"
									onLayout={(event) => {
										const nextWidth = Math.floor(event.nativeEvent.layout.width)
										if (nextWidth > 0 && nextWidth !== chartWidth)
											setChartWidth(nextWidth)
									}}
								>
									<LineChart
										data={chartData}
										width={chartPlotWidth}
										height={180}
										spacing={chartSpacing}
										initialSpacing={12}
										endSpacing={12}
										nestedScrollEnabled
										showScrollIndicator={false}
										color="#5b21b6"
										thickness={3}
										dataPointsColor="#5b21b6"
										dataPointsRadius={4}
										startFillColor="#7e22ce"
										endFillColor="#ffffff"
										startOpacity={0.25}
										endOpacity={0.02}
										areaChart
										yAxisTextStyle={{ color: "#71717a", fontSize: 10 }}
										xAxisLabelTextStyle={{ color: "#71717a", fontSize: 10 }}
										yAxisColor="transparent"
										xAxisColor="#e4e4e7"
										rulesColor="#f4f4f5"
										noOfSections={4}
									/>
								</View>
							) : (
								<Text className="py-10 text-center text-zinc-500">
									Mais dados são necessários para exibir a evolução.
								</Text>
							)}
							<Text className="mt-3 text-xs text-zinc-400">
								Baseado em {history.reduce((sum, item) => sum + item.offers, 0)}{" "}
								oferta(s)
							</Text>
						</View>

						<View className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4">
							<Text className="text-lg font-bold text-zinc-900">
								Histórico de preços
							</Text>
							<HistoryHeader />
							{history.slice(0, 5).map((item) => (
								<HistoryRow key={item.isoDate} item={item} />
							))}
						</View>
					</>
				)}
			</ScrollView>

			<PriceFiltersModal
				visible={filterVisible}
				municipalities={municipalities}
				municipality={municipality}
				onMunicipalityChange={setMunicipality}
				selectedDate={selectedDate}
				onDateChange={setSelectedDate}
				showPeriodFilter={false}
				onClose={() => setFilterVisible(false)}
			/>

			<DateSelectionModal
				visible={dateModalVisible}
				initialDate={selectedDate ? new Date(`${selectedDate}T12:00:00`) : new Date()}
				maximumDate={new Date()}
				onApply={(date) => {
					setSelectedDate(isoDate(date))
					setDateModalVisible(false)
				}}
				onCancel={() => setDateModalVisible(false)}
			/>
		</View>
	)
}

function Variation({ value }: { value: number }) {
	const up = value >= 0
	const Icon = up ? TrendingUp : TrendingDown
	return (
		<View
			className={`flex-row items-center gap-1 rounded-full px-3 py-1 ${up ? "bg-green-50" : "bg-red-50"}`}
		>
			<Icon size={14} color={up ? "#16a34a" : "#ef4444"} />
			<Text className={`text-sm font-bold ${up ? "text-green-600" : "text-red-500"}`}>
				{value > 0 ? "+" : ""}
				{value.toFixed(1).replace(".", ",")}%
			</Text>
		</View>
	)
}

function HistoryHeader() {
	return (
		<View className="mt-5 flex-row border-b border-zinc-100 pb-3">
			<Text className="flex-1 text-sm font-semibold text-zinc-600">Data</Text>
			<Text className="flex-1 text-center text-sm font-semibold text-zinc-600">
				Preço médio
			</Text>
			<Text className="flex-1 text-right text-sm font-semibold text-zinc-600">Variação</Text>
		</View>
	)
}

function HistoryRow({ item }: { item: PriceHistoryItem }) {
	return (
		<View className="flex-row items-center border-b border-zinc-100 py-3">
			<Text className="flex-1 text-sm text-zinc-700">{item.date}</Text>
			<Text className="flex-1 text-center text-sm font-medium text-zinc-800">
				R$ {formatCurrency(item.price)}
			</Text>
			<View className="flex-1 items-end">
				{item.variation === null ? (
					<Text className="text-zinc-400">—</Text>
				) : (
					<Variation value={item.variation} />
				)}
			</View>
		</View>
	)
}
