import { DateSelectionModal } from "@/components/DateSelectionModal"
import { Header } from "@/components/Header"
import { useAuth } from "@/hooks/useAuth"
import { MunicipalityAveragePrice, offersApi } from "@/server/offers"
import { router } from "expo-router"
import {
	BadgeCheck,
	CalendarDays,
	ChevronRight,
	MapPin,
	RefreshCw,
	TrendingUp,
	X,
} from "lucide-react-native"
import { useEffect, useState } from "react"
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from "react-native"

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

type MunicipalityAveragesScreenProps = {
	embedded?: boolean
	selectable?: boolean
	title?: string
	subtitle?: string
}

export default function MunicipalityAveragesScreen({
	embedded = false,
	selectable = true,
	title = "Médias por município",
	subtitle = "Selecione um município para ver as ofertas",
}: MunicipalityAveragesScreenProps) {
	const [myAverage, setMyAverage] = useState<MunicipalityAveragePrice | null>(null)
	const [municipalities, setMunicipalities] = useState<MunicipalityAveragePrice[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [calendarVisible, setCalendarVisible] = useState(false)
	const { user } = useAuth()

	async function loadAverages() {
		try {
			setLoading(true)
			setError("")
			const [ownAverage, municipalityAverages] = await Promise.all([
				offersApi.averagePriceForMyMunicipality(selectedDate ?? undefined),
				offersApi.averagePriceByMunicipality(selectedDate ?? undefined),
			])
			setMyAverage(ownAverage)
			setMunicipalities(municipalityAverages)
		} catch (requestError: any) {
			console.error("Erro ao carregar médias municipais", requestError)
			setError(
				requestError?.response?.data?.message ??
					"Não foi possível carregar as médias por município.",
			)
		} finally {
			setLoading(false)
		}
	}

	function selectMunicipality(item: MunicipalityAveragePrice) {
		if (!selectable) return
		router.replace({
			pathname: "/(tabs)/sale",
			params: {
				...(item.municipalityId !== null
					? { municipalityId: String(item.municipalityId) }
					: {}),
				municipalityName: item.municipalityName,
			},
		})
	}

	useEffect(() => {
		loadAverages()
	}, [selectedDate])

	return (
		<View className="flex-1 bg-gray-50">
			<Header
				title={title}
				subtitle={subtitle}
				showBack={!embedded}
				rightAction={
					<Pressable
						onPress={() => setCalendarVisible(true)}
						accessibilityRole="button"
						accessibilityLabel="Selecionar data das médias"
						className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
					>
						<CalendarDays size={21} color="#FFFFFF" />
					</Pressable>
				}
			/>

			<View className="px-5 pt-6 pb-6 rounded-2xl border border-zinc-200 bg-white mt-3 mx-4">
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

				{/* <View className="flex-row items-center mt-5">
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
				</View> */}
			</View>

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

			{loading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#512B76" />
					<Text className="mt-3 text-gray-500">Calculando médias...</Text>
				</View>
			) : error ? (
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-center text-red-600">{error}</Text>
					<Pressable
						onPress={loadAverages}
						className="mt-4 flex-row items-center gap-2 rounded-xl bg-purple-900 px-5 py-3"
					>
						<RefreshCw size={17} color="#FFFFFF" />
						<Text className="font-semibold text-white">Tentar novamente</Text>
					</Pressable>
				</View>
			) : (
				<FlatList
					data={municipalities}
					keyExtractor={(item, index) =>
						String(item.municipalityId ?? `${item.municipalityName}-${index}`)
					}
					showsVerticalScrollIndicator={false}
					contentContainerClassName="p-5 pb-10"
					ListHeaderComponent={
						<View>
							{myAverage ? (
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
							Nenhuma média municipal disponível.
						</Text>
					}
				/>
			)}
		</View>
	)
}
