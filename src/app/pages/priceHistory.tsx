import { AcaiOffer } from "@/components/AcaiCard"
import { Header } from "@/components/Header"
import { periodOptions, PriceFiltersModal } from "@/components/PriceFiltersModal"
import { server } from "@/server/api"
import { buildPriceHistory, formatCurrency, getMunicipalityKey, PricePeriod } from "@/utils/priceAnalytics"
import { useLocalSearchParams } from "expo-router"
import { Filter, TrendingDown, TrendingUp } from "lucide-react-native"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native"

export default function PriceHistoryScreen() {
	const params = useLocalSearchParams<{ municipality?: string; period?: string }>()
	const [offers, setOffers] = useState<AcaiOffer[]>([])
	const [loading, setLoading] = useState(true)
	const [filtersVisible, setFiltersVisible] = useState(false)
	const [municipality, setMunicipality] = useState(params.municipality || "all")
	const parsedPeriod = Number(params.period)
	const [period, setPeriod] = useState<PricePeriod>([0, 7, 30, 90].includes(parsedPeriod) ? parsedPeriod as PricePeriod : 30)
	const municipalities = useMemo(() => [...new Set(offers.map(getMunicipalityKey))].sort(), [offers])
	const history = useMemo(() => buildPriceHistory(offers, municipality, period), [offers, municipality, period])

	useEffect(() => {
		server.get("/offers").then((response) => setOffers(response.data?.data?.data ?? [])).catch((error) => console.log("Erro ao carregar histórico:", error)).finally(() => setLoading(false))
	}, [])

	return <View className="flex-1 bg-zinc-50">
		<Header title="Histórico de preços" subtitle="Médias calculadas a partir das ofertas" showBack rightAction={<Pressable onPress={() => setFiltersVisible(true)} accessibilityLabel="Filtrar histórico" className="h-10 w-10 items-center justify-center rounded-full bg-white/15"><Filter size={21} color="#fff" /></Pressable>} />
		<View className="border-b border-zinc-200 bg-white px-5 py-3"><Text className="font-semibold text-purple-950">{municipality === "all" ? "Todos os municípios" : municipality}</Text><Text className="mt-1 text-sm text-zinc-500">{periodOptions.find((item) => item.value === period)?.label} · {history.reduce((sum, item) => sum + item.offers, 0)} oferta(s)</Text></View>
		{loading ? <View className="flex-1 items-center justify-center"><ActivityIndicator size="large" color="#5b21b6" /></View> : <FlatList data={history} keyExtractor={(item) => item.isoDate} contentContainerClassName="p-5 pb-10" renderItem={({ item }) => { const up = (item.variation ?? 0) >= 0; const Icon = up ? TrendingUp : TrendingDown; return <View className="mb-3 flex-row items-center rounded-2xl border border-zinc-200 bg-white p-4"><View className="flex-1"><Text className="font-semibold text-zinc-900">{item.date}</Text><Text className="mt-1 text-xs text-zinc-500">{item.offers} oferta(s) considerada(s)</Text></View><View className="items-end"><Text className="text-lg font-bold text-purple-900">R$ {formatCurrency(item.price)}</Text>{item.variation === null ? <Text className="text-sm text-zinc-400">Sem comparação</Text> : <View className="mt-1 flex-row items-center gap-1"><Icon size={14} color={up ? "#16a34a" : "#ef4444"} /><Text className={up ? "font-semibold text-green-600" : "font-semibold text-red-500"}>{item.variation > 0 ? "+" : ""}{item.variation.toFixed(1).replace(".", ",")}%</Text></View>}</View></View> }} ListEmptyComponent={<View className="items-center py-24"><Text className="text-lg font-bold text-zinc-800">Nenhum preço encontrado</Text><Text className="mt-2 text-center text-zinc-500">Tente selecionar outro município ou período.</Text></View>} />}
		<PriceFiltersModal visible={filtersVisible} municipalities={municipalities} municipality={municipality} period={period} onMunicipalityChange={setMunicipality} onPeriodChange={setPeriod} onClose={() => setFiltersVisible(false)} />
	</View>
}
