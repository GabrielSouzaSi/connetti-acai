import { routeDate } from "@/utils/routeDate"
import PageBuyerHomeScreen from "@/app/pages/buyer/home"
import { AcaiCard, AcaiOffer } from "@/components/AcaiCard"
import {
	filterOffers,
	MunicipalityFilterOption,
	OfferExplorerHeader,
	OfferTypeFilter,
} from "@/components/OfferExplorerHeader"
import { useAccess } from "@/hooks/useAccess"
import { useAuth } from "@/hooks/useAuth"
import { server } from "@/server/api"
import { router, useLocalSearchParams } from "expo-router"
import { List, MapPin } from "lucide-react-native"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native"

type OffersResponse = {
	data: {
		data: AcaiOffer[]
	}
}

export default function TabSaleScreen() {
	const params = useLocalSearchParams<{
		municipalityId?: string
		municipalityName?: string
	}>()
	const { user } = useAuth()
	const { isAdmin } = useAccess()
	const activePlanSlug = user?.active_subscription?.plan.slug?.toLowerCase()
	const hasPaidPlan =
		isAdmin || Boolean(activePlanSlug && !["free", "gratuito"].includes(activePlanSlug))

	const hasSelectedMunicipality = Boolean(params.municipalityId || params.municipalityName)
	if (!hasSelectedMunicipality || !hasPaidPlan) return <PageBuyerHomeScreen />

	return <MunicipalityOffersScreen />
}

function MunicipalityOffersScreen() {
	const [offers, setOffers] = useState<AcaiOffer[]>([])
	const [loading, setLoading] = useState(true)
	const [refreshing, setRefreshing] = useState(false)
	const [loadError, setLoadError] = useState(false)
	const requestVersion = useRef(0)
	const [municipalities, setMunicipalities] = useState<MunicipalityFilterOption[]>([])
	const [query, setQuery] = useState("")
	const [typeFilter, setTypeFilter] = useState<OfferTypeFilter>("all")
	const { canAccess } = useAccess()
	const { user } = useAuth()
	const params = useLocalSearchParams<{
		municipalityId?: string
		municipalityName?: string
		date?: string
	}>()
	const selectedDate = routeDate(params.date)
	const selectedMunicipalityId = params.municipalityId ? Number(params.municipalityId) : null
	const municipalityId = Number.isInteger(selectedMunicipalityId)
		? selectedMunicipalityId
		: params.municipalityName
			? null
			: user?.municipality_id
	const municipalityName = params.municipalityName ?? user?.municipality?.name
	const isUsingDefaultMunicipality = municipalityId === user?.municipality_id
	const municipalityOptions = useMemo<MunicipalityFilterOption[]>(() => {
		const options = new Map<string, MunicipalityFilterOption>(
			municipalities.map((municipality) => [String(municipality.id), municipality]),
		)

		for (const offer of offers) {
			if (!offer.municipality?.name) continue
			options.set(String(offer.municipality.id), {
				id: offer.municipality.id,
				name: offer.municipality.name,
				state: offer.municipality.state,
			})
		}

		if (municipalityName) {
			options.set(String(municipalityId ?? municipalityName), {
				id: municipalityId ?? null,
				name: municipalityName,
				state: municipalityId === user?.municipality_id ? user?.municipality?.state : null,
			})
		}

		return [...options.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
	}, [municipalities, municipalityId, municipalityName, offers, user])
	const municipalityOffers = useMemo(() => {
		return offers.filter((offer) => {
			if (municipalityId != null) {
				return offer.municipality?.id === municipalityId
			}

			return (
				offer.municipality?.name.toLocaleLowerCase("pt-BR") ===
				municipalityName?.toLocaleLowerCase("pt-BR")
			)
		})
	}, [municipalityId, municipalityName, offers])
	const visibleOffers = useMemo(
		() => filterOffers(municipalityOffers, query, typeFilter),
		[municipalityOffers, query, typeFilter],
	)
	const hasActiveOfferFilters = query.trim().length > 0 || typeFilter !== "all"
	const offersCountLabel = hasActiveOfferFilters
		? `${visibleOffers.length} de ${municipalityOffers.length} ofertas`
		: `${municipalityOffers.length} ${municipalityOffers.length === 1 ? "oferta disponível" : "ofertas disponíveis"}`

	const image = require("@/assets/acai.jpg")

	const loadOffers = useCallback(
		async (refresh = false) => {
			const version = ++requestVersion.current
			setLoadError(false)
			setLoading(true)
			setRefreshing(refresh)

			try {
				const endpoint =
					municipalityId != null ? `/municipalities/${municipalityId}/offers` : "/offers"
				const response = await server.get<OffersResponse>(
					endpoint,
					selectedDate ? { params: { date: selectedDate } } : undefined,
				)
				if (version !== requestVersion.current) return
				setOffers(response.data.data.data)
			} catch (error) {
				if (version !== requestVersion.current) return
				setLoadError(true)
				console.log("Erro ao carregar ofertas:", error)
			} finally {
				if (version === requestVersion.current) {
					setLoading(false)
					setRefreshing(false)
				}
			}
		},
		[municipalityId, selectedDate],
	)

	function refreshOffers() {
		if (loading) return
		void loadOffers(true)
	}

	useEffect(() => {
		setOffers([])
		void loadOffers()
		return () => {
			requestVersion.current += 1
		}
	}, [loadOffers])

	useEffect(() => {
		let active = true
		server
			.get<{ data: MunicipalityFilterOption[] }>("/municipalities")
			.then((response) => {
				if (active) setMunicipalities(response.data.data)
			})
			.catch((error) => console.log("Erro ao carregar municípios:", error))
		return () => {
			active = false
		}
	}, [])

	return (
		<View className="flex-1 bg-white">
			<OfferExplorerHeader
				query={query}
				onQueryChange={setQuery}
				typeFilter={typeFilter}
				onTypeFilterChange={setTypeFilter}
				municipalities={municipalityOptions}
				selectedMunicipalityId={municipalityId ?? null}
				selectedMunicipalityName={municipalityName}
				onMunicipalityChange={(municipality) =>
					router.setParams({
						municipalityId:
							municipality.id !== null ? String(municipality.id) : undefined,
						municipalityName: municipality.name,
					})
				}
			/>

			<FlatList
				data={visibleOffers}
				refreshing={refreshing}
				onRefresh={refreshOffers}
				progressViewOffset={12}
				keyExtractor={(item) => String(item.id)}
				contentContainerClassName="px-5 pb-6"
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={
					<View className="mb-4">
						<Pressable
							accessibilityRole="button"
							onPress={() =>
								router.setParams({ municipalityId: "", municipalityName: "" })
							}
							className="mt-4 self-start py-2"
						>
							<Text className="font-semibold text-purple-900">
								← Voltar às médias por município
							</Text>
						</Pressable>
						<View className="mt-4 flex-row items-center justify-between gap-3 py-2">
							<Text className="flex-1 text-2xl font-bold text-purple-950">
								Ofertas em {municipalityName ?? "seu município"}
							</Text>
							{canAccess("manageOffers") ? (
								<Pressable
									onPress={() => router.push("/pages/myOffers")}
									accessibilityRole="button"
									accessibilityLabel="Listar minhas ofertas"
									className="flex-row items-center gap-2 rounded-xl bg-purple-950 px-3 py-2"
								>
									<List size={17} color="#FFFFFF" />
									<Text className="font-semibold text-white">Minhas ofertas</Text>
								</Pressable>
							) : null}
						</View>

						<Text className="text-lg font-bold text-purple-950">
							Encontre as melhores ofertas de açaí da Amazônia
						</Text>
						{!loading ? (
							<Text className="mt-2 text-sm font-semibold text-gray-500">
								{offersCountLabel}
								{selectedDate
									? ` · Data: ${selectedDate.split("-").reverse().join("/")}`
									: ""}
							</Text>
						) : null}

						<Pressable
							onPress={() =>
								router.setParams({
									municipalityId:
										user?.municipality_id != null
											? String(user.municipality_id)
											: "",
									municipalityName: user?.municipality?.name ?? "",
								})
							}
							disabled={isUsingDefaultMunicipality}
							accessibilityRole="button"
							accessibilityLabel="Exibir ofertas da minha região"
							accessibilityState={{ disabled: isUsingDefaultMunicipality }}
							className={`mt-4 self-start flex-row items-center gap-2 rounded-xl border px-4 py-3 ${
								isUsingDefaultMunicipality
									? "border-gray-200 bg-gray-100"
									: "border-purple-300 bg-purple-50"
							}`}
						>
							<MapPin
								size={18}
								color={isUsingDefaultMunicipality ? "#9CA3AF" : "#512B76"}
							/>
							<Text
								className={
									isUsingDefaultMunicipality
										? "font-semibold text-gray-400"
										: "font-semibold text-purple-900"
								}
							>
								Minha região
							</Text>
						</Pressable>
					</View>
				}
				renderItem={({ item }) => <AcaiCard item={item} image={image} />}
				ListFooterComponent={
					!loading && !refreshing && loadError ? (
						<View className="items-center py-4">
							<Text className="mb-2 text-center text-gray-500">
								Não foi possível carregar as ofertas.
							</Text>
							<Pressable
								onPress={() => void loadOffers()}
								accessibilityRole="button"
								className="rounded-xl bg-purple-950 px-4 py-3"
							>
								<Text className="font-semibold text-white">Tentar novamente</Text>
							</Pressable>
						</View>
					) : null
				}
				ListEmptyComponent={
					<View className="mt-24 items-center justify-center">
						{loading ? (
							<>
								<ActivityIndicator size="large" color="#512B76" />
								<Text className="mt-3 text-lg font-bold text-gray-500">
									Carregando ofertas...
								</Text>
							</>
						) : (
							<Text className="text-center text-lg font-bold text-gray-500">
								{loadError
									? "A consulta de ofertas não foi concluída."
									: query || typeFilter !== "all"
										? "Nenhuma oferta encontrada com esses filtros."
										: `Não há ofertas disponíveis em ${municipalityName ?? "este município"}.`}
							</Text>
						)}
					</View>
				}
			/>
		</View>
	)
}
