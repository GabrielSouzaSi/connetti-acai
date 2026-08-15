import { useAuth } from "@/hooks/useAuth"
import { Header } from "@/components/Header"
import { negotiationsApi } from "@/server/negotiations"
import { getNegotiationId, getNegotiationParties, getNegotiationProposer, getOfferOwner, isSaleOffer } from "@/utils/negotiationRoles"
import { useFocusEffect, router } from "expo-router"
import { CalendarClock, ChevronRight, Handshake, MessageCircle, RefreshCw } from "lucide-react-native"
import { useCallback, useState } from "react"
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native"

type Negotiation = Record<string, any> & { id: number; status?: string }

function getItems(response: any): Negotiation[] {
	const data = response?.data?.data
	if (Array.isArray(data)) return data
	if (Array.isArray(data?.data)) return data.data
	return []
}

function statusLabel(status?: string) {
	const labels: Record<string, string> = {
		pending: "Pendente",
		accepted: "Aceita",
		rejected: "Recusada",
		completed: "Concluída",
		cancelled: "Cancelada",
		canceled: "Cancelada",
	}
	return labels[String(status).toLowerCase()] ?? status ?? "Em negociação"
}

function formatDate(value?: string | null) {
	if (!value) return null
	const normalized = value.includes("T") ? value : value.replace(" ", "T")
	const date = new Date(normalized)
	if (Number.isNaN(date.getTime())) return value

	return date.toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	})
}

export default function TabMessageScreen() {
	const { user } = useAuth()
	const [items, setItems] = useState<Negotiation[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")

	const load = useCallback(async () => {
		try {
			setLoading(true)
			setError("")
			const response = await negotiationsApi.list()
			setItems(getItems(response))
		} catch (requestError: any) {
			console.error("[Negociação] Erro ao listar", {
				status: requestError?.response?.status,
				response: requestError?.response?.data,
			})
			setError(requestError?.response?.data?.message ?? "Não foi possível carregar as negociações.")
		} finally {
			setLoading(false)
		}
	}, [])

	useFocusEffect(useCallback(() => void load(), [load]))

	return (
		<View className="flex-1 bg-gray-50">
			<Header title="Minhas negociações" subtitle={`Propostas e conversas de ${user?.name ?? "você"}`} />

			{loading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#512B76" />
				</View>
			) : error ? (
				<View className="flex-1 items-center justify-center px-6">
					<Text className="text-center text-red-600">{error}</Text>
					<Pressable onPress={load} className="mt-4 flex-row items-center gap-2 rounded-xl bg-purple-900 px-5 py-3">
						<RefreshCw size={17} color="#fff" />
						<Text className="font-semibold text-white">Tentar novamente</Text>
					</Pressable>
				</View>
			) : (
				<FlatList
					data={items}
					showsVerticalScrollIndicator={false}
					keyExtractor={(item, index) => String(getNegotiationId(item) ?? index)}
					contentContainerClassName="p-5 pb-12"
					renderItem={({ item }) => {
						const offer = item.offer ?? {}
						const negotiationId = getNegotiationId(item)
						const { amOwner } = getNegotiationParties(item, Number(user?.id))
						const roleLabel = amOwner ? (isSaleOffer(offer) ? "Você vende · proposta recebida" : "Sua oferta · proposta recebida") : "Você compra · proposta enviada"
						const proposer = getNegotiationProposer(item)
						const counterpart = amOwner ? proposer : getOfferOwner(offer)
						const proposalDate = formatDate(item.proposed_at ?? item.created_at ?? item.dates?.created_at ?? item.dates?.proposal_date)
						const price = Number(item.proposed_price ?? item.price)
						const rawVolume = item.proposed_volume ?? item.volume
						const volume = typeof rawVolume === "object" ? rawVolume?.original : rawVolume
						const unit =
							item.proposed_unit ??
							item.unit ??
							(typeof rawVolume === "object" ? rawVolume?.unit : undefined) ??
							offer.volume?.unit ??
							"unidade"
						return (
							<Pressable
								onPress={() => router.push({ pathname: "/pages/negotiation", params: { negotiation: JSON.stringify(item) } })}
								className="mb-3 flex-row items-center rounded-2xl border border-gray-200 bg-white p-4"
							>
								<View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-purple-100">
									<Handshake size={24} color="#512B76" />
								</View>
								<View className="flex-1">
									<View className="mb-1 flex-row items-center justify-between gap-2">
										<Text className="flex-1 text-xs font-bold uppercase text-purple-700">{roleLabel}</Text>
										<Text className="text-xs font-bold text-gray-500">#{negotiationId ?? "—"}</Text>
									</View>
									<Text className="font-bold text-gray-900">{counterpart?.name ?? `Negociação #${negotiationId ?? "—"}`}</Text>
									<Text className="mt-1 text-sm text-gray-600">
										{Number.isFinite(price) ? `R$ ${price.toFixed(2).replace(".", ",")}` : "Preço não informado"} · {volume ?? "—"} {unit}
									</Text>
									<Text className="mt-1 text-xs font-semibold text-purple-700">{statusLabel(item.status)}</Text>
									{proposalDate ? <View className="mt-2 flex-row items-center gap-1"><CalendarClock size={13} color="#6B7280" /><Text className="text-xs text-gray-500">Proposta de {proposalDate}</Text></View> : null}
								</View>
								<ChevronRight size={22} color="#9CA3AF" />
							</Pressable>
						)
					}}
					ListEmptyComponent={
						<View className="mt-24 items-center px-8">
							<MessageCircle size={56} color="#9CA3AF" />
							<Text className="mt-4 text-lg font-bold text-gray-900">Nenhuma negociação</Text>
							<Text className="mt-2 text-center text-gray-500">Abra uma oferta e envie uma proposta para começar.</Text>
						</View>
					}
				/>
			)}
		</View>
	)
}
