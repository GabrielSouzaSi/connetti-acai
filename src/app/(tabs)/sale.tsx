import { AcaiCard, AcaiOffer } from "@/components/AcaiCard"
import {
	filterOffers,
	OfferExplorerHeader,
	OfferTypeFilter,
} from "@/components/OfferExplorerHeader"
import { useAccess } from "@/hooks/useAccess"
import { useAuth } from "@/hooks/useAuth"
import { server } from "@/server/api"
import { router, useLocalSearchParams } from "expo-router"
import { List } from "lucide-react-native"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native"

export default function TabSaleScreen() {
	const [offers, setOffers] = useState<AcaiOffer[]>([])
	const [loading, setLoading] = useState(true)
	const [query, setQuery] = useState("")
	const [typeFilter, setTypeFilter] = useState<OfferTypeFilter>("all")
	const { canAccess } = useAccess()
	const { user } = useAuth()
	const params = useLocalSearchParams<{
		municipalityId?: string
		municipalityName?: string
	}>()
	const selectedMunicipalityId = params.municipalityId
		? Number(params.municipalityId)
		: null
	const municipalityId = Number.isInteger(selectedMunicipalityId)
		? selectedMunicipalityId
		: user?.municipality_id
	const municipalityName = params.municipalityName ?? user?.municipality?.name
	const municipalityOffers = useMemo(() => {
		return offers.filter((offer) => {
			if (municipalityId != null && offer.municipality?.id === municipalityId) {
				return true
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

	const image = require("@/assets/acai.jpg")

	async function loadOffers() {
		try {
			const response = await server.get("/offers")

			setOffers(response.data.data.data)
		} catch (error) {
			console.log("Erro ao carregar ofertas:", error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadOffers()
	}, [])

	return (
		<View className="flex-1 bg-white">
			<OfferExplorerHeader
				query={query}
				onQueryChange={setQuery}
				typeFilter={typeFilter}
				onTypeFilterChange={setTypeFilter}
			/>

			<FlatList
				data={visibleOffers}
				keyExtractor={(item) => String(item.id)}
				contentContainerClassName="px-5 pb-6"
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={
					<View className="mb-4">
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
					</View>
				}
				renderItem={({ item }) => <AcaiCard item={item} image={image} />}
				ListEmptyComponent={
					<View className="mt-24 items-center justify-center">
						{loading ? (
							<>
								<ActivityIndicator size="large" color="#512B76" />
								<Text className="mt-3 text-lg font-bold text-gray-500">Carregando ofertas...</Text>
							</>
						) : (
							<Text className="text-center text-lg font-bold text-gray-500">
								{query || typeFilter !== "all"
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
