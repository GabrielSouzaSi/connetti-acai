import { router } from "expo-router"
import { MapPin, Package, Star, TrendingUp } from "lucide-react-native"
import { Image, Pressable, Text, useWindowDimensions, View } from "react-native"

export interface AcaiOffer {
	id: number
	type: "sell" | "buy"
	status: "active" | "negotiating" | string
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
		expires_at: string
		created_at: string
		updated_at: string
	}
	user: {
		id: number
		name: string
		email?: string
		created_at: string
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

interface AcaiCardProps {
	item: AcaiOffer
	image: any
}

export function AcaiCard({ item, image }: AcaiCardProps) {
	const { width } = useWindowDimensions()
	const isCompact = width < 480
	const typeLabel = item.type === "sell" ? "Venda" : "Compra"

	const statusLabel =
		item.status === "active"
			? "Ativo"
			: item.status === "negotiating"
				? "Negociando"
				: item.status

	const openDetails = () =>
		router.push({
			pathname: "/pages/offerDetails",
			params: { offer: JSON.stringify(item) },
		})

	if (isCompact) {
		return (
			<View className="mb-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
				<View className="flex-row gap-3">
					<Image source={image} className="h-28 w-28 rounded-2xl" resizeMode="cover" />

					<View className="min-w-0 flex-1">
						<View className="flex-row items-start gap-1">
							<MapPin size={15} color="#7C3AED" />
							<Text
								numberOfLines={2}
								className="min-w-0 flex-1 text-sm font-medium text-gray-700"
							>
								{item.municipality.name} - {item.municipality.state}
							</Text>
						</View>

						<View className="mt-2 flex-row items-center gap-1">
							<Package size={15} color="#6B7280" />
							<Text className="text-base font-semibold text-gray-900">
								{item.volume.kg.toLocaleString("pt-BR")} kg
							</Text>
						</View>

						<Text numberOfLines={1} className="mt-1 text-xs text-gray-400">
							{item.volume.original} {item.volume.unit} disponíveis
						</Text>

						<View className="mt-2 flex-row items-end justify-between gap-2">
							<View className="min-w-0 flex-1">
								<Text
									numberOfLines={1}
									adjustsFontSizeToFit
									className="text-2xl font-bold text-violet-700"
								>
									R$ {item.price.toFixed(2).replace(".", ",")}
								</Text>
								<Text className="text-xs text-gray-400">/ {item.volume.unit}</Text>
							</View>

							<View className="items-end">
								<View className="flex-row items-center gap-1">
									<TrendingUp size={13} color="#16A34A" />
									<Text className="text-xs font-semibold text-green-600">{item.volume.lata} latas</Text>
								</View>
								<Text className="text-[10px] text-gray-400">{item.volume.tela} telas</Text>
							</View>
						</View>
					</View>
				</View>

				<View className="mt-3 flex-row flex-wrap items-center gap-2">
					<Text className="rounded-full bg-violet-100 px-2 py-1 text-xs text-violet-700">
						{typeLabel}
					</Text>
					<Text className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
						{statusLabel}
					</Text>
				</View>

				<View className="mt-3 flex-row items-center justify-between gap-3">
					<View className="min-w-0 flex-1 flex-row items-center gap-1">
						<Star size={14} fill="#FACC15" color="#FACC15" />
						<Text numberOfLines={1} className="flex-1 text-xs text-gray-500">{item.user.name}</Text>
					</View>

					<Pressable onPress={openDetails} className="rounded-xl border border-green-300 bg-green-100 px-4 py-2">
						<Text className="text-sm font-semibold text-green-700">Ver detalhes</Text>
					</Pressable>
				</View>
			</View>
		)
	}

	return (
		<View className="bg-white rounded-2xl p-3 mb-4 shadow-sm border border-gray-100 flex-row gap-3">
			<Image source={image} className="w-28 h-28 rounded-2xl" resizeMode="cover" />

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

						<Text className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
							{statusLabel}
						</Text>
					</View>
				</View>

				<View className="flex-row items-center gap-1">
					<Star size={14} fill="#FACC15" color="#FACC15" />

					<Text className="text-xs text-gray-500">{item.user.name}</Text>
				</View>
			</View>

			<View className="justify-between items-end">
				<View className="items-end">
					<Text className="text-2xl font-bold text-violet-700">
						R$ {item.price.toFixed(2).replace(".", ",")}
					</Text>

					<Text className="text-xs text-gray-400">/ {item.volume.unit}</Text>

					<View className="flex-row items-center gap-1 mt-2">
						<TrendingUp size={14} color="#16A34A" />

						<Text className="text-green-600 font-semibold text-sm">
							{item.volume.lata} latas
						</Text>
					</View>

					<Text className="text-[10px] text-gray-400">{item.volume.tela} telas</Text>
				</View>

				<Pressable
					onPress={openDetails}
					className="bg-green-100 border border-green-300 px-4 py-2 rounded-xl"
				>
					<Text className="text-green-700 font-semibold text-sm">Ver detalhes</Text>
				</Pressable>
			</View>
		</View>
	)
}
