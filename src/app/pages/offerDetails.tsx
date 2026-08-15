import { Header } from "@/components/Header"
import { useAuth } from "@/hooks/useAuth"
import { getOfferOwnerId } from "@/utils/negotiationRoles"
import { router, useLocalSearchParams } from "expo-router"
import { CalendarClock, Handshake, MapPin, Package, Scale } from "lucide-react-native"
import { Image, Pressable, ScrollView, Text, View } from "react-native"

type OfferDetails = {
	id: number
	type: string | number
	status?: string
	price: number | string
	product_id?: number
	product_name?: string
	product?: { id?: number; name?: string } | null
	original_volume?: number
	original_unit?: string | number
	volume?: {
		original?: number
		unit?: string
		kg?: number
		lata?: number
		tela?: number
	}
	dates?: {
		offer_date?: string
		expires_at?: string | null
		created_at?: string
		updated_at?: string
	}
	created_at?: string
	expires_at?: string | null
	user?: { id?: number; name?: string } | null
	municipality?: { id?: number; name?: string; state?: string } | null
}

function formatDate(value?: string | null) {
	if (!value) return "Não informada"

	const [date] = value.split(" ")
	const [year, month, day] = date.split("-")
	if (!year || !month || !day) return value

	return `${day}/${month}/${year}`
}

function formatNumber(value?: number) {
	if (value === undefined || !Number.isFinite(value)) return "—"
	return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(".", ",")
}

function parseOffer(value?: string): OfferDetails | null {
	if (!value) return null

	try {
		return JSON.parse(value) as OfferDetails
	} catch {
		return null
	}
}

export default function PageOfferDetails() {
	const { user } = useAuth()
	const image = require("@/assets/acai.jpg")
	const params = useLocalSearchParams<{ offer?: string | string[] }>()
	const serializedOffer = Array.isArray(params.offer) ? params.offer[0] : params.offer
	const offer = parseOffer(serializedOffer)

	if (!offer) {
		return (
			<View className="flex-1 items-center justify-center bg-white px-6">
				<Text className="text-lg font-bold text-gray-900">Oferta indisponível</Text>
				<Text className="mt-2 text-center text-gray-500">
					Não foi possível carregar os detalhes desta oferta.
				</Text>
				<Pressable onPress={() => router.back()} className="mt-6 rounded-xl bg-purple-900 px-6 py-3">
					<Text className="font-semibold text-white">Voltar</Text>
				</Pressable>
			</View>
		)
	}

	const rawType = String(offer.type).toLowerCase()
	const isBuyOffer = rawType === "buy" || rawType === "buyer" || rawType === "1"
	const typeLabel = isBuyOffer ? "Oferta de compra" : "Oferta de venda"
	const productName = offer.product?.name ?? offer.product_name ?? "Açaí"
	const originalVolume = offer.volume?.original ?? offer.original_volume
	const originalUnit = offer.volume?.unit ?? String(offer.original_unit ?? "unidade")
	const createdAt = offer.dates?.offer_date ?? offer.dates?.created_at ?? offer.created_at
	const expiresAt = offer.dates?.expires_at ?? offer.expires_at
	const price = Number(offer.price)
	const isOwner = getOfferOwnerId(offer) === Number(user?.id)
	const participantLabel = isBuyOffer ? "Comprador" : "Produtor · vendedor"
	const actionLabel = isBuyOffer ? "Fazer proposta de venda" : "Fazer proposta de compra"

	return (
		<View className="flex-1 bg-gray-50">
			<Header title="Detalhes da oferta" showBack />

			<ScrollView
				className="flex-1"
				contentContainerClassName="p-5 pb-10"
				showsVerticalScrollIndicator={false}
			>
				<Image source={image} className="h-48 w-full rounded-2xl" resizeMode="cover" />

				<View className="mt-4 rounded-2xl border border-gray-200 bg-white p-5">
					<View className="flex-row items-start justify-between gap-3">
						<View className="flex-1">
							<Text className="text-sm text-gray-500">Produto</Text>
							<Text className="mt-1 text-xl font-bold text-gray-900">{productName}</Text>
						</View>
						<Text className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
							{typeLabel}
						</Text>
					</View>

					{offer.status ? (
						<Text className="mt-3 self-start rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
							{offer.status}
						</Text>
					) : null}
				</View>

				<View className="mt-4 rounded-2xl border border-gray-200 bg-white p-5">
					<Text className="text-sm text-gray-500">Preço</Text>
					<Text className="mt-1 text-3xl font-bold text-purple-950">
						R$ {Number.isFinite(price) ? price.toFixed(2).replace(".", ",") : "—"}
					</Text>
					<Text className="mt-1 text-sm text-gray-500">por {originalUnit}</Text>
				</View>

				<View className="mt-4 rounded-2xl border border-gray-200 bg-white p-5">
					<View className="flex-row items-center gap-2">
						<Scale size={20} color="#15803D" />
						<Text className="font-semibold text-gray-900">Quantidade</Text>
					</View>
					<Text className="mt-3 text-2xl font-bold text-green-700">
						{originalVolume ?? "—"} {originalUnit}
					</Text>

					<View className="mt-4 flex-row rounded-xl bg-gray-50 p-4">
						<View className="flex-1">
							<Text className="text-xs text-gray-500">Quilogramas</Text>
							<Text className="mt-1 font-bold text-gray-800">
								{formatNumber(offer.volume?.kg)} kg
							</Text>
						</View>
						<View className="flex-1 items-center border-x border-gray-200">
							<Text className="text-xs text-gray-500">Latas</Text>
							<Text className="mt-1 font-bold text-gray-800">
								{formatNumber(offer.volume?.lata)}
							</Text>
						</View>
						<View className="flex-1 items-end">
							<Text className="text-xs text-gray-500">Telas</Text>
							<Text className="mt-1 font-bold text-gray-800">
								{formatNumber(offer.volume?.tela)}
							</Text>
						</View>
					</View>
				</View>

				<View className="mt-4 rounded-2xl border border-gray-200 bg-white p-5">
					<View className="flex-row items-center gap-3">
						<CalendarClock size={20} color="#512B76" />
						<View>
							<Text className="text-xs text-gray-500">Publicada em</Text>
							<Text className="font-semibold text-gray-900">{formatDate(createdAt)}</Text>
						</View>
					</View>
					<View className="mt-4 flex-row items-center gap-3">
						<CalendarClock size={20} color="#512B76" />
						<View>
							<Text className="text-xs text-gray-500">Validade</Text>
							<Text className="font-semibold text-gray-900">{formatDate(expiresAt)}</Text>
						</View>
					</View>
				</View>

				{offer.municipality?.name ? (
					<View className="mt-4 flex-row items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5">
						<MapPin size={22} color="#512B76" />
						<View className="flex-1">
							<Text className="text-xs text-gray-500">Município</Text>
							<Text className="font-semibold text-gray-900">
								{offer.municipality.name}
								{offer.municipality.state ? ` - ${offer.municipality.state}` : ""}
							</Text>
						</View>
					</View>
				) : null}

				{offer.user?.name ? (
					<View className="mt-4 flex-row items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5">
						<Package size={22} color="#512B76" />
						<View className="flex-1">
							<Text className="text-xs font-semibold uppercase text-purple-700">{participantLabel}</Text>
							<Text className="font-semibold text-gray-900">{offer.user.name}</Text>
							<Text className="mt-1 text-xs text-gray-500">
								{isBuyOffer ? "Quer comprar o produto anunciado." : "É quem está vendendo e decide sobre as propostas."}
							</Text>
						</View>
						{isOwner ? <Text className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">Você</Text> : null}
					</View>
				) : null}

				{isOwner ? (
					<View className="mt-5 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3">
						<Text className="font-bold text-purple-900">Esta oferta é sua</Text>
						<Text className="mt-1 text-sm text-purple-700">Acompanhe as propostas recebidas em Minhas negociações.</Text>
					</View>
				) : <Pressable
					onPress={() =>
						router.push({
							pathname: "/pages/negotiation",
							params: { offer: JSON.stringify(offer) },
						})
					}
					className="mt-5 flex-row items-center justify-center gap-2 rounded-xl bg-green-600 py-4"
				>
					<Handshake size={20} color="#fff" />
					<Text className="font-bold text-white">{actionLabel}</Text>
				</Pressable>
				}
			</ScrollView>
		</View>
	)
}
