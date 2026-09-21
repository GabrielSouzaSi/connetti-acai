import { DateSelectionModal } from "@/components/DateSelectionModal"
import { Header } from "@/components/Header"
import { PriceFiltersModal } from "@/components/PriceFiltersModal"
import { Profile } from "@/components/Profile"
import { useAuth } from "@/hooks/useAuth"
import {
	DashboardPeriod,
	DashboardPriceItem,
	PriceDashboard,
	MunicipalityAveragePrice,
	offersApi,
} from "@/server/offers"
import { formatCurrency } from "@/utils/priceAnalytics"
import { router } from "expo-router"
import {
	CalendarDays,
	ChevronDown,
	ChevronRight,
	Filter,
	MapPin,
	ArrowDownRight,
	ArrowUpRight,
} from "lucide-react-native"
import { useEffect, useMemo, useState } from "react"
import { LineChart } from "react-native-gifted-charts"
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	Text,
	useWindowDimensions,
	View,
} from "react-native"

function formatVolume(value: number | null | undefined) {
	return value == null ? "—" : `${value.toLocaleString("pt-BR", { maximumFractionDigits: 3 })} kg`
}

const dashboardPeriods: DashboardPeriod[] = [7, 15, 30, 90]

function displayDate(date: string) {
	return new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR")
}

function municipalityKey(item: Pick<MunicipalityAveragePrice, "municipalityName" | "state">) {
	return `${item.municipalityName}${item.state ? ` - ${item.state}` : ""}`
}

function isoDate(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
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
	const [dashboard, setDashboard] = useState<PriceDashboard | null>(null)
	const [dashboardMunicipalities, setDashboardMunicipalities] = useState<
		PriceDashboard["filter_options"]["municipalities"]
	>([])
	const [days, setDays] = useState<DashboardPeriod>(7)
	const [historyPage, setHistoryPage] = useState(1)
	const [dashboardLoading, setDashboardLoading] = useState(true)
	const [dashboardError, setDashboardError] = useState(false)
	const [retry, setRetry] = useState(0)
	const { user } = useAuth()
	const [filterVisible, setFilterVisible] = useState(false)
	const [dateModalVisible, setDateModalVisible] = useState(false)
	const [municipalitySelection, setMunicipality] = useState<string | null>(null)
	const userMunicipality = user?.municipality
		? municipalityKey({
				municipalityName: user.municipality.name,
				state: user.municipality.state,
			})
		: ""
	const municipality = municipalitySelection ?? userMunicipality
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [focusedChartPoint, setFocusedChartPoint] = useState<{
		value: number
		date: string
		volume: number | null
	} | null>(null)
	const [chartWidth, setChartWidth] = useState(Math.max(windowWidth - 64, 280))

	const municipalities = useMemo(
		() =>
			[
				...new Set([
					...(userMunicipality ? [userMunicipality] : []),
					...dashboardMunicipalities.map((item) =>
						municipalityKey({ municipalityName: item.name, state: item.state }),
					),
				]),
			].sort(),
		[dashboardMunicipalities, userMunicipality],
	)
	const selectedMunicipalityId =
		municipality === userMunicipality
			? (user?.municipality_id ?? user?.municipality?.id)
			: (dashboardMunicipalities.find(
					(item) =>
						municipalityKey({ municipalityName: item.name, state: item.state }) ===
						municipality,
				)?.id ?? undefined)
	const displayedAverages = useMemo(() => {
		if (!dashboard || dashboard.filters.municipality_id !== selectedMunicipalityId) return []
		const location =
			dashboard.filter_options.municipalities.find(
				(item) => item.id === selectedMunicipalityId,
			) ??
			(selectedMunicipalityId === (user?.municipality_id ?? user?.municipality?.id)
				? user?.municipality
				: undefined)
		if (!location) return []
		return [
			{
				municipalityId: location.id,
				municipalityName: location.name,
				state: location.state,
				averagePrice: dashboard.summary.average_price,
				offersCount: dashboard.summary.offers_count,
				totalVolumeKg: dashboard.summary.total_volume_kg,
				calculationDate: dashboard.summary.date,
				isUserMunicipality:
					location.id === (user?.municipality_id ?? user?.municipality?.id),
			},
		]
	}, [dashboard, selectedMunicipalityId, user])
	const history = dashboard?.history.data ?? []
	const summary = dashboard?.summary
	const dateLabel = `Data: ${displayDate(selectedDate ?? isoDate(new Date()))}`
	const chartData = [...(dashboard?.chart ?? [])]
		.filter((item) => item.average_price != null && Number.isFinite(item.average_price))
		.sort((a, b) => a.date.localeCompare(b.date))
		.map((item) => ({
			value: item.average_price!,
			volume: item.total_volume_kg,
			label: displayDate(item.date).slice(0, 5),
			date: displayDate(item.date),
		}))
	const chartPlotWidth = Math.max(chartWidth - 35, 1)
	const chartSpacing =
		chartData.length > 1 ? Math.max(56, (chartPlotWidth - 24) / (chartData.length - 1)) : 56

	useEffect(() => {
		let active = true
		setDashboardLoading(true)
		setDashboardError(false)
		setDashboard(null)
		setFocusedChartPoint(null)
		if (selectedMunicipalityId == null) {
			setDashboardLoading(false)
			setDashboardError(true)
			return
		}
		offersApi
			.priceDashboard({
				municipality_id: selectedMunicipalityId,
				days,
				end_date: selectedDate ?? undefined,
				page: historyPage,
				per_page: days,
			})
			.then((result) => {
				if (!active) return
				setDashboard(result)
				setDashboardMunicipalities(result.filter_options.municipalities)
			})
			.catch(() => {
				if (active) setDashboardError(true)
			})
			.finally(() => {
				if (active) setDashboardLoading(false)
			})
		return () => {
			active = false
		}
	}, [selectedMunicipalityId, municipality, days, selectedDate, historyPage, retry])

	function changeMunicipality(value: string) {
		setMunicipality(value)
		setHistoryPage(1)
	}

	function changeDate(value: string | null) {
		setSelectedDate(value)
		setHistoryPage(1)
	}

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
				<Profile plan={false} assessment={false} />

				<View className="mt-4 flex-row gap-3">
					<View className="flex-1 gap-2">
						<Text className="text-sm font-medium text-zinc-600">Município</Text>
						<FilterButton
							icon={<MapPin size={18} color="#6b21a8" />}
							title={municipality || "Selecionar município"}
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

				<View className="mt-5 gap-3">
					<Text className="text-lg font-bold text-zinc-900">Médias por município</Text>
					{dashboardLoading ? (
						<View className="items-center py-12">
							<ActivityIndicator size="large" color="#5b21b6" />
							<Text className="mt-3 text-zinc-500">Carregando médias...</Text>
						</View>
					) : dashboardError ? null : displayedAverages.length === 0 ? (
						<View className="items-center rounded-2xl border border-zinc-200 bg-white px-6 py-12">
							<Text className="text-lg font-bold text-zinc-800">
								Sem médias nesta data
							</Text>
							<Text className="mt-2 text-center text-zinc-500">
								Altere o município ou selecione outra data.
							</Text>
						</View>
					) : (
						displayedAverages.map((item) => (
							<Pressable
								key={item.municipalityId ?? municipalityKey(item)}
								onPress={() =>
									router.push({
										pathname: "/(tabs)/sale",
										params: {
											municipalityId: "",
											municipalityName: "",
											date: selectedDate ?? "",
										},
									})
								}
								accessibilityRole="button"
								accessibilityLabel="Ver médias por município"
								className={`rounded-2xl border p-4 ${item.isUserMunicipality ? "border-purple-600 bg-purple-50" : "border-zinc-200 bg-white"}`}
							>
								{item.isUserMunicipality ? (
									<View className="mb-3 flex-row items-center gap-1">
										<MapPin size={14} color="#6b21a8" />
										<Text className="text-xs font-bold text-purple-800">
											Seu município
										</Text>
									</View>
								) : null}
								<View className="flex-row items-center justify-between gap-3">
									<Text className="flex-1 text-base font-semibold text-zinc-900">
										{municipalityKey(item)}
									</Text>
									<ChevronRight size={22} color="#6b21a8" />
								</View>
								<View className="mt-2 flex-row items-baseline gap-1">
									<Text className="text-2xl font-bold text-purple-900">
										{item.averagePrice != null
											? `R$ ${formatCurrency(item.averagePrice)}`
											: "Sem média nesta data"}
									</Text>
									{item.averagePrice != null ? (
										<Text className="text-sm text-zinc-600">/kg</Text>
									) : null}
								</View>
								{item.offersCount != null ? (
									<Text className="mt-2 text-xs text-zinc-500">
										Baseado em {item.offersCount} oferta(s) · Volume total:{" "}
										{formatVolume(item.totalVolumeKg)}
									</Text>
								) : null}
							</Pressable>
						))
					)}
				</View>

				<View className="mt-6">
					<Text className="mb-2 text-sm font-medium text-zinc-600">
						Período do gráfico e histórico
					</Text>
					<View className="flex-row gap-2">
						{dashboardPeriods.map((period) => (
							<Pressable
								key={period}
								accessibilityRole="button"
								accessibilityState={{ selected: days === period }}
								onPress={() => {
									setDays(period)
									setHistoryPage(1)
								}}
								className={`flex-1 items-center rounded-xl border py-3 ${days === period ? "border-purple-800 bg-purple-800" : "border-zinc-200 bg-white"}`}
							>
								<Text
									className={
										days === period
											? "font-semibold text-white"
											: "text-zinc-700"
									}
								>
									{period} dias
								</Text>
							</Pressable>
						))}
					</View>
				</View>

				{dashboardLoading ? (
					<View className="items-center py-24">
						<ActivityIndicator size="large" color="#5b21b6" />
						<Text className="mt-3 text-zinc-500">Carregando médias históricas...</Text>
					</View>
				) : dashboardError ? (
					<View className="mt-6 items-center rounded-2xl border border-zinc-200 bg-white p-6">
						<Text className="text-center text-zinc-600">
							Não foi possível carregar o gráfico e o histórico.
						</Text>
						<Pressable
							accessibilityRole="button"
							onPress={() => setRetry((value) => value + 1)}
							className="mt-4 rounded-xl bg-purple-900 px-4 py-3"
						>
							<Text className="font-semibold text-white">Tentar novamente</Text>
						</Pressable>
					</View>
				) : (
					<>
						<View className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4">
							<Text className="text-lg font-bold text-zinc-900">
								Evolução do preço (R$/kg)
							</Text>
							<View className="mt-5 flex-row items-start justify-between">
								<View className="flex-row items-end">
									<Text className="text-3xl font-bold text-purple-900">
										{summary?.average_price != null
											? `R$ ${formatCurrency(summary.average_price)}`
											: "Sem média"}
									</Text>
									{summary?.average_price != null ? (
										<Text className="mb-1 ml-1 text-sm text-zinc-600">/kg</Text>
									) : null}
								</View>
								{summary?.variation_percentage != null ? (
									<View className="items-end gap-1">
										<Variation value={summary.variation_percentage} />
										<Text
											className={`text-xs ${summary.variation_percentage >= 0 ? "text-green-700" : "text-red-600"}`}
										>
											Comparado a {summary.comparison_days} dias
										</Text>
									</View>
								) : null}
							</View>

							{chartData.length > 0 ? (
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
										showScrollIndicator
										focusEnabled
										unFocusOnPressOut={false}
										onFocus={(point: {
											value: number
											date: string
											volume: number | null
										}) => setFocusedChartPoint(point)}
										color="#5b21b6"
										thickness={2}
										dataPointsColor="#5b21b6"
										dataPointsRadius={3}
										customDataPoint={() => (
											<View
												style={{
													width: 7,
													height: 7,
													borderRadius: 4,
													borderWidth: 2,
													borderColor: "#5b21b6",
													backgroundColor: "white",
												}}
											/>
										)}
										pointerConfig={{
											activatePointersInstantlyOnTouch: false,
											activatePointersOnLongPress: true,
											activatePointersDelay: 200,
											pointerColor: "#5b21b6",
											pointerStripColor: "#c4b5fd",
											pointerStripWidth: 1,
											radius: 5,
											pointerLabelWidth: 130,
											pointerLabelHeight: 78,
											autoAdjustPointerLabelPosition: true,
											persistPointer: true,
											resetPointerIndexOnRelease: false,
											resetPointerOnDataChange: true,
											pointerLabelComponent: (
												items: Array<{
													value: number
													date: string
													volume: number | null
												}>,
											) => {
												const point = items[0]
												return point ? (
													<View
														style={{
															width: 130,
															borderRadius: 10,
															padding: 8,
															backgroundColor: "#3b0764",
														}}
													>
														<Text
															style={{
																color: "#e9d5ff",
																fontSize: 11,
															}}
														>
															{point.date}
														</Text>
														<Text
															style={{
																color: "white",
																fontSize: 14,
																fontWeight: "700",
															}}
														>
															R$ {formatCurrency(point.value)} /kg
														</Text>
														<Text
															style={{
																color: "#e9d5ff",
																fontSize: 11,
															}}
														>
															Volume: {formatVolume(point.volume)}
														</Text>
													</View>
												) : null
											},
										}}
										startFillColor="#6b21a8"
										endFillColor="#ffffff"
										startOpacity={0.3}
										endOpacity={0.02}
										areaChart
										yAxisTextStyle={{ color: "#71717a", fontSize: 10 }}
										xAxisLabelTextStyle={{ color: "#71717a", fontSize: 10 }}
										yAxisColor="transparent"
										xAxisColor="#e4e4e7"
										hideRules
										formatYLabel={(label) =>
											Number(label).toFixed(2).replace(".", ",")
										}
										noOfSections={4}
									/>
								</View>
							) : (
								<Text className="py-10 text-center text-zinc-500">
									Sem médias disponíveis neste período.
								</Text>
							)}
							{focusedChartPoint ? (
								<View
									accessibilityLiveRegion="polite"
									className="mt-3 rounded-lg bg-purple-50 p-3"
								>
									<Text className="font-semibold text-purple-900">
										{focusedChartPoint.date} · R${" "}
										{formatCurrency(focusedChartPoint.value)} /kg
									</Text>
									<Text className="mt-1 text-xs text-purple-800">
										Volume total: {formatVolume(focusedChartPoint.volume)}
									</Text>
								</View>
							) : null}
							<Text className="mt-2 text-xs text-zinc-500">
								Deslize para ver todas as datas. Toque em um ponto ou mantenha
								pressionado para consultar.
							</Text>
							<View className="mt-4 flex-row flex-wrap justify-between gap-2">
								<Text className="text-xs text-zinc-500">
									Fonte: {dashboard?.metadata?.source ?? "Rede Açaí"}
								</Text>
								{dashboard?.metadata?.updated_at ? (
									<Text className="text-xs text-zinc-500">
										Atualizado em{" "}
										{new Date(dashboard.metadata.updated_at).toLocaleDateString(
											"pt-BR",
											{ day: "2-digit", month: "2-digit" },
										)}{" "}
										às{" "}
										{new Date(dashboard.metadata.updated_at).toLocaleTimeString(
											"pt-BR",
											{ hour: "2-digit", minute: "2-digit" },
										)}
									</Text>
								) : null}
							</View>
						</View>

						<View className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4">
							<Text className="text-lg font-bold text-zinc-900">
								Histórico de preços
							</Text>
							<Text className="mt-2 text-sm text-zinc-500">
								{dashboard
									? `${displayDate(dashboard.filters.start_date)} a ${displayDate(dashboard.filters.end_date)}`
									: ""}
							</Text>
							<HistoryHeader />
							{history.map((item) => (
								<HistoryRow key={item.date} item={item} />
							))}
							{history.length === 0 ? (
								<Text className="py-6 text-center text-zinc-500">
									Sem histórico neste período.
								</Text>
							) : null}
							{dashboard && dashboard.history.last_page > 1 ? (
								<View className="mt-4 flex-row items-center justify-between">
									<Pressable
										accessibilityRole="button"
										disabled={historyPage <= 1}
										onPress={() => setHistoryPage((page) => page - 1)}
									>
										<Text
											className={
												historyPage <= 1
													? "text-zinc-400"
													: "text-purple-900"
											}
										>
											Anterior
										</Text>
									</Pressable>
									<Text>
										{dashboard.history.current_page} /{" "}
										{dashboard.history.last_page}
									</Text>
									<Pressable
										accessibilityRole="button"
										disabled={historyPage >= dashboard.history.last_page}
										onPress={() => setHistoryPage((page) => page + 1)}
									>
										<Text
											className={
												historyPage >= dashboard.history.last_page
													? "text-zinc-400"
													: "text-purple-900"
											}
										>
											Próxima
										</Text>
									</Pressable>
								</View>
							) : null}
						</View>
					</>
				)}
			</ScrollView>

			<PriceFiltersModal
				visible={filterVisible}
				municipalities={municipalities}
				municipality={municipality}
				onMunicipalityChange={changeMunicipality}
				selectedDate={selectedDate}
				onDateChange={changeDate}
				showPeriodFilter={false}
				showAllMunicipalities={false}
				onClose={() => setFilterVisible(false)}
			/>

			<DateSelectionModal
				visible={dateModalVisible}
				initialDate={selectedDate ? new Date(`${selectedDate}T12:00:00`) : new Date()}
				maximumDate={new Date()}
				onApply={(date) => {
					changeDate(isoDate(date))
					setDateModalVisible(false)
				}}
				onCancel={() => setDateModalVisible(false)}
			/>
		</View>
	)
}

function Variation({ value, compact = false }: { value: number; compact?: boolean }) {
	const up = value >= 0
	const Icon = up ? ArrowUpRight : ArrowDownRight
	return (
		<View
			className={`flex-row items-center gap-1 ${compact ? "" : `rounded-md px-3 py-1 ${up ? "bg-green-50" : "bg-red-50"}`}`}
		>
			<Icon size={14} color={up ? "#16a34a" : "#ef4444"} />
			<Text className={`text-sm font-bold ${up ? "text-green-600" : "text-red-500"}`}>
				{value.toFixed(1).replace(".", ",")}%
			</Text>
		</View>
	)
}

function HistoryHeader() {
	return (
		<View className="mt-5 flex-row border-b border-zinc-100 pb-3">
			<Text className="flex-1 text-xs font-semibold text-zinc-600">Data</Text>
			<Text className="flex-1 text-center text-xs font-semibold text-zinc-600">
				Preço médio (R$/kg)
			</Text>
			<Text className="flex-1 text-right text-xs font-semibold text-zinc-600">Variação</Text>
		</View>
	)
}

function HistoryRow({ item }: { item: DashboardPriceItem }) {
	return (
		<View className="flex-row items-center border-b border-zinc-100 py-3">
			<Text className="flex-1 text-sm text-zinc-700">{displayDate(item.date)}</Text>
			<View className="flex-1 items-center">
				<Text className="text-sm font-medium text-zinc-800">
					{item.average_price != null ? formatCurrency(item.average_price) : "—"}
				</Text>
				<Text className="mt-1 text-xs text-zinc-500">
					Volume: {formatVolume(item.total_volume_kg)}
				</Text>
			</View>
			<View className="flex-1 items-end">
				{item.variation_percentage == null ? (
					<Text className="text-zinc-400">—</Text>
				) : (
					<Variation value={item.variation_percentage} compact />
				)}
			</View>
		</View>
	)
}
