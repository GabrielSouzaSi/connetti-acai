import { AcaiCard, AcaiOffer } from "@/components/AcaiCard"
import { server } from "@/server/api"
import { Filter, Search } from "lucide-react-native"
import { useEffect, useState } from "react"
import { FlatList, Image, StatusBar, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import colors from "tailwindcss/colors"

export default function TabSaleScreen() {
	const [offers, setOffers] = useState<AcaiOffer[]>([])
	const [loading, setLoading] = useState(true)

	const image = require("@/assets/acai.jpg")

	async function loadOffers() {
		try {
			// const response = await server.get("/offers")
			const response = await server.get("https://fastify-auth-api.onrender.com/offers")

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

	if (loading) {
		return (
			<View className="flex-1 items-center justify-center bg-white">
				<Text className="text-lg font-bold text-gray-500">Carregando ofertas...</Text>
			</View>
		)
	}

	if (offers.length === 0) {
		return (
			<View className="flex-1 items-center justify-center bg-white">
				<Text className="text-lg font-bold text-gray-500">Nenhuma oferta disponível</Text>
			</View>
		)
	}

	return (
		<View className="flex-1 bg-white">
			<StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

			<SafeAreaView edges={["top"]} style={{ backgroundColor: "#512B76" }} />

			<View className="flex-row items-center justify-between px-5 pb-4 bg-white">
				<View className="w-[54px] h-[22px] bg-transparent" />

				<Image
					className="w-40 h-16"
					source={require("@/assets/logo.png")}
					resizeMode="contain"
				/>

				<View className="flex-row items-center gap-5">
					<Search size={22} color={colors.purple[950]} />
					<Filter size={22} color={colors.purple[950]} />
				</View>
			</View>

			<FlatList
				data={offers}
				keyExtractor={(item) => String(item.id)}
				contentContainerClassName="px-5 pb-6"
				showsVerticalScrollIndicator={false}
				ListHeaderComponent={
					<View className="mb-4">
						<Text className="text-2xl font-bold text-purple-950 py-2">
							Ofertas disponíveis
						</Text>

						<Text className="text-lg font-bold text-purple-950">
							Encontre as melhores ofertas de açaí da Amazônia
						</Text>
					</View>
				}
				renderItem={({ item }) => <AcaiCard item={item} image={image} />}
			/>
		</View>
	)
}
