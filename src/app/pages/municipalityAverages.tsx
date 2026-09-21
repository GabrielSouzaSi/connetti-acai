import { useMunicipalityOffers } from "@/hooks/useMunicipalityOffers"
import { routeDate } from "@/utils/routeDate"
import { DateSelectionModal } from "@/components/DateSelectionModal"
import { Header } from "@/components/Header"
import { Profile } from "@/components/Profile"
import { useAuth } from "@/hooks/useAuth"
import { MunicipalityAveragePrice, offersApi } from "@/server/offers"
import { router, useFocusEffect, useLocalSearchParams } from "expo-router"
import {
	CalendarDays,
	ChevronRight,
	MapPin,
	RefreshCw,
	Search,
	TrendingUp,
	X,
} from "lucide-react-native"
import { useCallback, useMemo, useRef, useState } from "react"
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from "react-native"

function volume(value: number | null) {
	return value == null ? "—" : `${value.toLocaleString("pt-BR", { maximumFractionDigits: 3 })} kg`
}

function currency(value: number) {
	return value.toLocaleString("pt-BR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})
}

function formatDate(value: string | null) {
	if (!value) return null
	const [year, month, day] = value.split("-")
	return year && month && day ? `${day}/${month}/${year}` : value
}

function toIsoDate(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function parseDate(value: string | null) {
	if (!value) return new Date()
	const parsed = new Date(`${value}T12:00:00`)
	return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function normalize(value: string | null) {
	return String(value ?? "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLocaleLowerCase("pt-BR")
}

type MunicipalityAveragesScreenProps = {
	embedded?: boolean
	selectable?: boolean
	allowDateSelection?: boolean
	title?: string
	subtitle?: string
}

export default function MunicipalityAveragesScreen({
	embedded = false,
	selectable = true,
	allowDateSelection = true,
	title = "Médias por município",
	subtitle = "Selecione um município para ver as ofertas",
}: MunicipalityAveragesScreenProps) {
	const requestVersion = useRef(0)
	const [municipalities, setMunicipalities] = useState<MunicipalityAveragePrice[]>([])
	const [loading, setLoading] = useState(true)
	const [refreshing, setRefreshing] = useState(false)
	const [error, setError] = useState("")
	const params = useLocalSearchParams<{ date?: string }>()
	const selectedDate = routeDate(params.date) ?? null
	function setSelectedDate(value: string | null) {
		router.setParams({ date: value ?? "" })
	}
	const [calendarVisible, setCalendarVisible] = useState(false)
	const [searchVisible, setSearchVisible] = useState(false)
	const [query, setQuery] = useState("")
	const { requestAccess, modal: upgradeModal } = useMunicipalityOffers()
	const { user } = useAuth()
	const myAverage =
		municipalities.find(
			(item) => item.municipalityId === (user?.municipality_id ?? user?.municipality?.id),
		) ?? null
	const normalizedQuery = normalize(query.trim())
	const filteredMunicipalities = useMemo(
		() =>
			municipalities.filter((item) =>
				normalize(`${item.municipalityName} ${item.state ?? ""}`).includes(normalizedQuery),
			),
		[municipalities, normalizedQuery],
	)
	const showMyAverage =
		myAverage !== null &&
		(!normalizedQuery ||
			normalize(`${myAverage.municipalityName} ${myAverage.state ?? ""}`).includes(
				normalizedQuery,
			))

	const loadAverages = useCallback(
		async (showLoading = true) => {
			const version = ++requestVersion.current
			try {
				if (showLoading) setLoading(true)
				setError("")
				const municipalityAverages = await offersApi.averagePriceByMunicipality(
					selectedDate ?? toIsoDate(new Date()),
				)
				if (version !== requestVersion.current) return
				setMunicipalities(municipalityAverages)
			} catch (requestError: any) {
				if (version !== requestVersion.current) return
				console.error("Erro ao carregar médias municipais", requestError)
				setError(
					requestError?.response?.data?.message ??
						"Não foi possível carregar as médias por município.",
				)
			} finally {
				if (version === requestVersion.current && showLoading) setLoading(false)
			}
		},
		[selectedDate],
	)

	const refreshAverages = useCallback(async () => {
		setRefreshing(true)
		try {
			await loadAverages(false)
		} finally {
			setRefreshing(false)
		}
	}, [loadAverages])

	function selectMunicipality(item: MunicipalityAveragePrice) {
		if (!selectable) return
		requestAccess(() =>
			router.replace({
				pathname: "/(tabs)/sale",
				params: {
					municipalityId: item.municipalityId != null ? String(item.municipalityId) : "",
					municipalityName: item.municipalityName,
					date: selectedDate ?? "",
				},
			}),
		)
	}

	useFocusEffect(
		useCallback(() => {
			void loadAverages()
			return () => {
				requestVersion.current += 1
			}
		}, [loadAverages]),
	)

	return (
		<View className="flex-1 bg-gray-50">
			{upgradeModal}
			<Header
				title={title}
				subtitle={subtitle}
				showBack={!embedded}
				rightAction={
					<View className="flex-row gap-2">
						<Pressable
							onPress={() => setSearchVisible((visible) => !visible)}
							accessibilityRole="button"
							accessibilityLabel="Pesquisar município"
							className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
						>
							<Search size={21} color="#FFFFFF" />
						</Pressable>
						{allowDateSelection ? (
							<Pressable
								onPress={() => setCalendarVisible(true)}
								accessibilityRole="button"
								accessibilityLabel="Selecionar data das médias"
								className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
							>
								<CalendarDays size={21} color="#FFFFFF" />
							</Pressable>
						) : null}
					</View>
				}
			>
				{searchVisible ? (
					<View className="flex-row items-center rounded-2xl bg-white px-4">
						<Search size={19} color="#6B7280" />
						<TextInput
							value={query}
							onChangeText={setQuery}
							placeholder="Pesquisar município ou estado"
							placeholderTextColor="#9CA3AF"
							autoFocus
							returnKeyType="search"
							className="flex-1 px-3 py-3 text-gray-900"
						/>
						<Pressable
							onPress={() => {
								setQuery("")
								setSearchVisible(false)
							}}
							accessibilityRole="button"
							accessibilityLabel="Fechar pesquisa"
							className="h-8 w-8 items-center justify-center"
						>
							<X size={19} color="#6B7280" />
						</Pressable>
					</View>
				) : null}
			</Header>

			<Profile plan={false} assessment={false} />

			{allowDateSelection ? (
				<>
					<View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-5 py-3">
						<View>
							<Text className="text-xs text-gray-500">Data das médias</Text>
							<Text className="font-semibold text-purple-950">
								{selectedDate ? formatDate(selectedDate) : "Hoje"}
							</Text>
						</View>
						{selectedDate ? (
							<Pressable
								onPress={() => setSelectedDate(null)}
								accessibilityRole="button"
								accessibilityLabel="Voltar para as médias de hoje"
								className="flex-row items-center gap-1 rounded-full bg-purple-100 px-3 py-2"
							>
								<X size={15} color="#512B76" />
								<Text className="text-sm font-semibold text-purple-900">Hoje</Text>
							</Pressable>
						) : null}
					</View>

					<DateSelectionModal
						visible={calendarVisible}
						initialDate={parseDate(selectedDate)}
						maximumDate={new Date()}
						onApply={(date) => {
							setSelectedDate(toIsoDate(date))
							setCalendarVisible(false)
						}}
						onCancel={() => setCalendarVisible(false)}
					/>
				</>
			) : null}

			{loading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#512B76" />
					<Text className="mt-3 text-gray-500">Calculando médias...</Text>
				</View>
			) : error ? (
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-center text-red-600">{error}</Text>
					<Pressable
						onPress={() => void loadAverages()}
						className="mt-4 flex-row items-center gap-2 rounded-xl bg-purple-900 px-5 py-3"
					>
						<RefreshCw size={17} color="#FFFFFF" />
						<Text className="font-semibold text-white">Tentar novamente</Text>
					</Pressable>
				</View>
			) : (
				<FlatList
					data={filteredMunicipalities}
					refreshing={refreshing}
					onRefresh={refreshAverages}
					progressViewOffset={12}
					keyExtractor={(item, index) =>
						String(item.municipalityId ?? `${item.municipalityName}-${index}`)
					}
					showsVerticalScrollIndicator={false}
					contentContainerClassName="p-5 pb-10"
					ListHeaderComponent={
						<View>
							{showMyAverage ? (
								<Pressable
									onPress={() => selectMunicipality(myAverage)}
									disabled={!selectable}
									className="mb-6 rounded-2xl bg-purple-950 p-5"
								>
									<View className="flex-row items-center gap-2">
										<MapPin size={17} color="#C4B5FD" />
										<Text className="font-medium text-purple-200">
											Seu município
										</Text>
									</View>
									<View className="mt-3 flex-row items-end justify-between gap-3">
										<View className="flex-1">
											<Text className="text-xl font-bold text-white">
												{myAverage.municipalityName}
												{myAverage.state ? ` - ${myAverage.state}` : ""}
											</Text>
											<Text className="mt-1 text-xs text-purple-200">
													Calculada em {formatDate(myAverage.calculationDate)}
												</Text>
												<Text className="mt-1 text-xs text-purple-200">
													Total de ofertas: {myAverage.offersCount ?? 0}
												</Text>
											<Text className="mt-1 text-xs text-purple-200">
												Volume total: {volume(myAverage.totalVolumeKg)}
											</Text>
										</View>
										<View className="items-end">
											<Text className="text-2xl font-bold text-white">
												R$ {currency(myAverage.averagePrice)}
											</Text>
											<Text className="text-xs text-purple-200">
												preço médio
											</Text>
										</View>
									</View>
								</Pressable>
							) : null}

							<View className="mb-3 flex-row items-center gap-2">
								<TrendingUp size={20} color="#512B76" />
								<Text className="text-xl font-bold text-purple-950">
									Todos os municípios
								</Text>
							</View>
						</View>
					}
					renderItem={({ item }) => (
						<Pressable
							onPress={() => selectMunicipality(item)}
							disabled={!selectable}
							className="mb-3 flex-row items-center rounded-2xl border border-gray-200 bg-white p-4"
						>
							<View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-purple-100">
								<MapPin size={21} color="#512B76" />
							</View>
							<View className="flex-1">
								<Text className="font-bold text-gray-900">
									{item.municipalityName}
									{item.state ? ` - ${item.state}` : ""}
								</Text>
								<Text className="mt-1 text-xs text-gray-500">
									{item.offersCount ?? 0} oferta(s) ·{" "}
									{formatDate(item.calculationDate)}
								</Text>
								<Text className="mt-1 text-xs text-gray-500">
									Volume total: {volume(item.totalVolumeKg)}
								</Text>
							</View>
							<View className="items-end">
								<Text className="text-lg font-bold text-purple-800">
									R$ {currency(item.averagePrice)}
								</Text>
								{selectable ? <ChevronRight size={20} color="#9CA3AF" /> : null}
							</View>
						</Pressable>
					)}
					ListEmptyComponent={
						<Text className="py-16 text-center text-gray-500">
							{normalizedQuery
								? "Nenhum município encontrado."
								: "Nenhuma média municipal disponível."}
						</Text>
					}
				/>
			)}
		</View>
	)
}
