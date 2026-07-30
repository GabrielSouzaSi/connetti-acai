import { server } from "@/server/api"
import { router } from "expo-router"
import {
	Calendar,
	CheckCircle,
	Clock,
	Eye,
	MapPin,
	Package,
	Pencil,
	Plus,
	TrendingUp,
	XCircle,
} from "lucide-react-native"
import { useEffect, useState } from "react"
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from "react-native"

export interface MyOffer {
	id: number
	type: "sell" | "buy"
	status: "active" | "expired" | "negotiating" | string
	price: number
	volume: {
		original: number
		unit: string
		kg: number
		lata: number
		tela: number
	}
	location: {
		latitude: number
		longitude: number
		distance_km: number | null
	}
	dates: {
		offer_date: string
		expires_at: string | null
		created_at: string
		updated_at: string
	}
	municipality: {
		id: number
		name: string
		state: string
		latitude: number
		longitude: number
	}
	property_id: number
	production_area_id: number
}

const acaiImage = require("@/assets/acai.jpg")

function formatPrice(value: number) {
	return value.toFixed(2).replace(".", ",")
}

function formatDate(date: string | null) {
	if (!date) return "Sem validade"

	const onlyDate = date.split(" ")[0]
	const [year, month, day] = onlyDate.split("-")

	return `${day}/${month}/${year}`
}

function getStatusConfig(status: string) {
	if (status === "active") {
		return {
			label: "Ativa",
			className: "bg-green-100",
			textClassName: "text-green-700",
			Icon: CheckCircle,
			color: "#16A34A",
		}
	}

	if (status === "expired") {
		return {
			label: "Expirada",
			className: "bg-red-100",
			textClassName: "text-red-700",
			Icon: XCircle,
			color: "#DC2626",
		}
	}

	if (status === "negotiating") {
		return {
			label: "Negociando",
			className: "bg-yellow-100",
			textClassName: "text-yellow-700",
			Icon: Clock,
			color: "#CA8A04",
		}
	}

	return {
		label: status,
		className: "bg-gray-100",
		textClassName: "text-gray-700",
		Icon: Clock,
		color: "#6B7280",
	}
}

function MyOfferCard({ item }: { item: MyOffer }) {
	const typeLabel = item.type === "sell" ? "Venda" : "Compra"
	const status = getStatusConfig(item.status)
	const StatusIcon = status.Icon

	return (
		<View className="bg-white rounded-2xl p-3 mb-4 shadow-sm border border-gray-100">
			<View className="flex-row gap-3">
				<Image source={acaiImage} className="w-28 h-28 rounded-2xl" resizeMode="cover" />

				<View className="flex-1 justify-between">
					<View className="gap-2">
						<View className="flex-row items-center gap-1">
							<MapPin size={14} color="#7C3AED" />
							<Text className="text-gray-700 font-medium text-sm">
								{item.municipality.name} - {item.municipality.state}
							</Text>
						</View>

						<View className="flex-row items-center gap-1">
							<Package size={14} color="#6B7280" />
							<Text className="text-gray-900 font-semibold text-base">
								{item.volume.kg.toLocaleString("pt-BR")} kg
							</Text>
						</View>

						<Text className="text-xs text-gray-400">
							{item.volume.original} {item.volume.unit} disponíveis
						</Text>

						<View className="flex-row gap-2">
							<Text className="bg-violet-100 text-violet-700 text-xs px-2 py-1 rounded-full">
								{typeLabel}
							</Text>

							<View
								className={`flex-row items-center gap-1 px-2 py-1 rounded-full ${status.className}`}
							>
								<StatusIcon size={12} color={status.color} />
								<Text className={`text-xs ${status.textClassName}`}>
									{status.label}
								</Text>
							</View>
						</View>
					</View>

					<View className="flex-row items-center gap-1">
						<Calendar size={13} color="#9CA3AF" />
						<Text className="text-xs text-gray-400">
							Criada em {formatDate(item.dates.created_at)}
						</Text>
					</View>
				</View>

				<View className="items-end justify-between">
					<View className="items-end">
						<Text className="text-2xl font-bold text-violet-700">
							R$ {formatPrice(item.price)}
						</Text>

						<Text className="text-xs text-gray-400">/ {item.volume.unit}</Text>

						<View className="flex-row items-center gap-1 mt-2">
							<TrendingUp size={14} color="#16A34A" />
							<Text className="text-green-600 font-semibold text-sm">
								{item.volume.lata.toFixed(2)} latas
							</Text>
						</View>

						<Text className="text-[10px] text-gray-400">
							{item.volume.tela.toFixed(2)} telas
						</Text>
					</View>
				</View>
			</View>

			<View className="flex-row gap-2 mt-4">
				<Pressable
					onPress={() =>
						router.push({
							pathname: "/pages/createSale",
							params: { offer: JSON.stringify(item) },
						})
					}
					className="flex-1 bg-green-100 border border-green-300 py-3 rounded-xl flex-row items-center justify-center gap-2"
				>
					<Eye size={16} color="#15803D" />
					<Text className="text-green-700 font-semibold text-sm">Ver detalhes</Text>
				</Pressable>

				<Pressable className="flex-1 bg-violet-100 border border-violet-300 py-3 rounded-xl flex-row items-center justify-center gap-2">
					<Pencil size={16} color="#6D28D9" />
					<Text className="text-violet-700 font-semibold text-sm">Editar</Text>
				</Pressable>
			</View>
		</View>
	)
}

export default function MyOffersScreen() {
	const [offers, setOffers] = useState<MyOffer[]>([])
	const [loading, setLoading] = useState(false)

	async function loadMyOffers() {
		try {
			setLoading(true)

			// const response = await server.get("/my/offers")
			const response = await server.get("https://fastify-auth-api.onrender.com/my/offers")

			const apiOffers = response.data?.data?.data ?? []
			setOffers(apiOffers)
		} catch (error) {
			console.log(error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		loadMyOffers()
	}, [])

	return (
		<View className="flex-1 bg-gray-50">
			<View className="px-5 pt-14 pb-4 bg-white border-b border-gray-100">
				<View className="flex-row items-center justify-between">
					<View>
						<Text className="text-2xl font-bold text-gray-900">Minhas Ofertas</Text>
						<Text className="text-gray-500 mt-1">Gerencie suas ofertas de açaí</Text>
					</View>

					<Pressable
						onPress={() => router.push("/pages/createSale")}
						className="w-12 h-12 bg-violet-700 rounded-full items-center justify-center"
					>
						<Plus size={24} color="#FFFFFF" />
					</Pressable>
				</View>
			</View>

			{loading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#7C3AED" />
					<Text className="text-gray-500 mt-3">Carregando ofertas...</Text>
				</View>
			) : (
				<FlatList
					data={offers}
					keyExtractor={(item) => String(item.id)}
					contentContainerClassName="p-5 pb-10"
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => <MyOfferCard item={item} />}
					ListEmptyComponent={
						<View className="items-center justify-center mt-20 px-6">
							<Package size={56} color="#9CA3AF" />
							<Text className="text-gray-900 font-bold text-lg mt-4">
								Nenhuma oferta criada
							</Text>
							<Text className="text-gray-500 text-center mt-2">
								Crie sua primeira oferta para vender ou comprar açaí.
							</Text>
						</View>
					}
				/>
			)}
		</View>
	)
}
