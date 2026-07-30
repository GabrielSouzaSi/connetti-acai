import { AcaiOffer } from "@/components/AcaiCard"
import { useAccess } from "@/hooks/useAccess"
import { router, useLocalSearchParams } from "expo-router"
import { ArrowLeft, CalendarClock, MapPin, MessageCircle, Scale, Share2 } from "lucide-react-native"
import { Image, Pressable, ScrollView, StatusBar, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

interface OfferDetailsProps {
	offer: AcaiOffer
}

export default function PageOfferDetails() {
	const image = require("@/assets/acai.jpg")
	const { canAccess } = useAccess()

	const { offer } = useLocalSearchParams<{
		offer: string
	}>()

	const offerData = JSON.parse(offer) as AcaiOffer

	return (
		<View className="flex-1 bg-white">
			<StatusBar barStyle="light-content" backgroundColor="#512B76" />

			<SafeAreaView edges={["top"]} style={{ backgroundColor: "#512B76" }} />

			<View className="bg-[#512B76] px-5 pb-4 flex-row items-center justify-between">
				<Pressable onPress={() => router.back()}>
					<ArrowLeft size={24} color="#FFF" />
				</Pressable>

				<Text className="text-white text-lg font-semibold">Detalhe da oferta</Text>

				<Pressable>
					<Share2 size={22} color="#FFF" />
				</Pressable>
			</View>

			<ScrollView
				className="flex-1"
				contentContainerClassName="p-5 pb-10"
				showsVerticalScrollIndicator={false}
			>
				<Text className="self-start bg-[#512B76] text-white px-3 py-1 rounded-md text-xs font-semibold mb-4">
					Oferta de açaí
				</Text>

				<View className="flex-row gap-4 mb-5">
					<Image source={image} className="w-36 h-36 rounded-xl" resizeMode="cover" />

					<View className="flex-1 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
						<Text className="text-gray-500 text-xs">Produto</Text>
						<Text className="text-gray-900 font-semibold mb-2">Açaí in natura</Text>

						<Text className="text-gray-500 text-xs">Vendedor</Text>
						<Text className="text-gray-900 font-semibold mb-3">
							{offerData.user.name}
						</Text>

						<View className="flex-row items-center gap-1">
							<CalendarClock size={14} color="#6B7280" />
							<Text className="text-gray-500 text-xs">
								Publicado em {offerData.dates.offer_date}
							</Text>
						</View>
					</View>
				</View>

				<View className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
					<Text className="text-gray-900 font-semibold mb-3">Quantidade informada</Text>

					<View className="flex-row items-center gap-2">
						<View className="bg-green-100 p-2 rounded-lg">
							<Scale size={22} color="#15803D" />
						</View>

						<Text className="text-2xl font-bold text-green-700">
							{offerData.volume.original}
						</Text>

						<Text className="text-lg font-semibold text-gray-800">
							{offerData.volume.unit}
						</Text>
					</View>
				</View>

				<View className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
					<Text className="text-gray-500 text-xs mb-3">
						Equivalência (Conversão visível)
					</Text>

					<View className="flex-row items-center">
						<View className="flex-1">
							<Text className="text-2xl font-bold text-slate-700">
								{offerData.volume.kg}
							</Text>
							<Text className="text-gray-500">kg</Text>
						</View>

						<View className="w-px h-10 bg-gray-200" />

						<View className="flex-1 items-center">
							<Text className="text-2xl font-bold text-slate-700">
								{offerData.volume.tela}
							</Text>
							<Text className="text-gray-500">telas</Text>
						</View>
					</View>
				</View>

				<View className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
					<Text className="text-gray-500 text-xs mb-1">Preço</Text>

					<Text className="text-2xl font-bold text-purple-950">
						R$ {offerData.price.toFixed(2).replace(".", ",")}
						<Text className="text-sm font-semibold text-gray-500">
							{" "}
							/ {offerData.volume.unit}
						</Text>
					</Text>
				</View>

				<View className="flex-row items-center gap-2 mb-5">
					<Text className="text-gray-500 text-sm">Município</Text>
					<MapPin size={16} color="#512B76" />
					<Text className="text-gray-900 font-semibold">
						{offerData.municipality.name}
					</Text>
				</View>

				{canAccess("startNegotiation") && (
					<Pressable
						onPress={() => router.push("/pages/negotiation")}
						className="bg-green-600 rounded-xl py-4 flex-row items-center justify-center gap-2 mb-3"
					>
						<MessageCircle size={20} color="#FFF" />
						<Text className="text-white font-bold text-base">Negociar</Text>
					</Pressable>
				)}

				<Pressable className="bg-white rounded-xl py-4 border border-gray-300 flex-row items-center justify-center gap-2">
					<MapPin size={20} color="#512B76" />
					<Text className="text-gray-700 font-semibold">Ver no mapa</Text>
				</Pressable>
			</ScrollView>
		</View>
	)
}
