import { useAccess } from "@/hooks/useAccess"
import { useAuth } from "@/hooks/useAuth"
import { server } from "@/server/api"
import axios from "axios"
import * as Location from "expo-location"
import { router, useLocalSearchParams } from "expo-router"
import { ChevronLeft, ChevronRight, Grid3X3, Info, Package, Scale } from "lucide-react-native"
import React, { useEffect, useMemo, useState } from "react"
import {
	ActivityIndicator,
	Alert,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native"

const COLORS = {
	primary: "#3B0A5F",
	green: "#2E7D32",
	background: "#F8F5FA",
}

const UNIDADES = {
	kg: {
		label: "kg",
		kg: 1,
	},
	lata: {
		label: "Lata",
		kg: 14,
	},
	tela: {
		label: "Tela",
		kg: 28,
	},
}

const formatCurrency = (value: string) => {
	const numericValue = value.replace(/\D/g, "")

	const number = Number(numericValue) / 100

	return number.toLocaleString("pt-BR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})
}

const formatLocalDate = (date: Date) => {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, "0")
	const day = String(date.getDate()).padStart(2, "0")

	return `${year}-${month}-${day}`
}

const addDays = (date: Date, days: number) => {
	const result = new Date(date)
	result.setDate(result.getDate() + days)
	return result
}

const parseCoordinate = (value: number | string | null | undefined) => {
	if (value === null || value === undefined || value === "") return null

	const coordinate = Number(value)
	return Number.isFinite(coordinate) ? coordinate : null
}

async function getOfferCoordinates(
	userLatitude: number | string | null | undefined,
	userLongitude: number | string | null | undefined,
) {
	const profileLatitude = parseCoordinate(userLatitude)
	const profileLongitude = parseCoordinate(userLongitude)

	if (profileLatitude !== null && profileLongitude !== null) {
		return { latitude: profileLatitude, longitude: profileLongitude }
	}

	const permission = await Location.requestForegroundPermissionsAsync()
	if (permission.status !== Location.PermissionStatus.GRANTED) return null

	const currentLocation = await Location.getCurrentPositionAsync({
		accuracy: Location.Accuracy.Balanced,
	})

	return {
		latitude: currentLocation.coords.latitude,
		longitude: currentLocation.coords.longitude,
	}
}

function getApiErrorMessage(error: unknown) {
	if (!axios.isAxiosError(error)) return "Não foi possível criar a oferta. Tente novamente."

	const responseData = error.response?.data as
		| { message?: string; errors?: Record<string, string[]> }
		| undefined
	const fieldMessage = responseData?.errors
		? Object.values(responseData.errors).flat().find(Boolean)
		: undefined

	return fieldMessage ?? responseData?.message ?? "Não foi possível criar a oferta."
}

export default function NovaOferta() {
	const { offer } = useLocalSearchParams()
	const { is } = useAccess()
	const { user } = useAuth()
	const [quantidade, setQuantidade] = useState("10")
	const [unidade, setUnidade] = useState<"kg" | "lata" | "tela">("lata")
	const [price, setPrice] = useState("0.00")
	const [submitting, setSubmitting] = useState(false)
	const isBuyOffer = is("buyer")
	const isSellOffer = is("producer")
	const offerTypeLabel = isBuyOffer ? "Compra" : "Venda"
	const validityDays = isBuyOffer ? 5 : 3
	const today = new Date()
	const displayedOfferDate = formatLocalDate(today)
	const displayedExpiresAt = formatLocalDate(addDays(today, validityDays))

	const corPrincipal = unidade === "tela" ? COLORS.green : COLORS.primary
	//console.log(JSON.stringify(user, null, 2))

	const handlePriceChange = (text: string) => {
		const numericValue = text.replace(/\D/g, "")
		setPrice(numericValue)
	}

	const formattedPrice = useMemo(() => {
		return formatCurrency(price)
	}, [price])

	const equivalencia = useMemo(() => {
		const valor = Number(quantidade.replace(",", ".")) || 0
		const totalKg = valor * UNIDADES[unidade].kg

		return {
			kg: totalKg,
			lata: totalKg / 14,
			tela: totalKg / 28,
		}
	}, [quantidade, unidade])

	function formatarValor(valor: number) {
		return Number.isInteger(valor) ? String(valor) : valor.toFixed(1).replace(".", ",")
	}

	useEffect(() => {
		if (offer) {
			try {
				const parsedOffer = JSON.parse(String(offer))
				setQuantidade(String(parsedOffer.volume.original))
				setUnidade(parsedOffer.volume.unit)
				setPrice(String(Math.round(Number(parsedOffer.price) * 100)))
			} catch {
				Alert.alert("Oferta inválida", "Não foi possível carregar os dados da oferta.")
			}
		}
	}, [offer])

	async function handleCreateOffer() {
		if (!isSellOffer) {
			Alert.alert(
				"Perfil necessário",
				"A criação de ofertas de venda está disponível apenas para o perfil produtor.",
			)
			return
		}

		const volume = Number(quantidade.replace(",", "."))
		const numericPrice = Number(price || "0") / 100
		const numericPropertyId = Number(user?.property_id) || 1
		const numericProductionAreaId = Number(user?.locality_id)

		if (!Number.isInteger(numericPropertyId) || numericPropertyId <= 0) {
			Alert.alert("Perfil incompleto", "A propriedade não foi encontrada no seu perfil.")
			return
		}

		if (!Number.isInteger(numericProductionAreaId) || numericProductionAreaId <= 0) {
			Alert.alert("Perfil incompleto", "A área de produção não foi encontrada no seu perfil.")
			return
		}

		if (!Number.isFinite(volume) || volume <= 0 || numericPrice <= 0) {
			Alert.alert("Dados incompletos", "Informe quantidade e preço maiores que zero.")
			return
		}

		if (!user?.municipality_id) {
			Alert.alert("Perfil incompleto", "O município do produtor é obrigatório.")
			return
		}

		try {
			setSubmitting(true)
			const offerDate = new Date()
			const expiresAt = addDays(offerDate, validityDays)
			//console.log("expiresat", expiresAt)

			// const coordinates = await getOfferCoordinates(user.latitude, user.longitude)

			// if (!coordinates) {
			// 	Alert.alert(
			// 		"Localização necessária",
			// 		"Permita o acesso à localização do aparelho para publicar esta oferta.",
			// 	)
			// 	return
			// }

			const payload = {
				municipality_id: user?.municipality_id,
				property_id: numericPropertyId,
				production_area_id: numericProductionAreaId,
				locality_id: 1,
				price: numericPrice,
				volume,
				unit: unidade,
				latitude: -16.729825,
				longitude: -43.854532,
				offer_date: formatLocalDate(offerDate),
				expires_at: formatLocalDate(expiresAt),
			}
			console.log("Dados: " + JSON.stringify(payload))

			await server.post("/offers/sell", payload)

			Alert.alert("Oferta criada", "Sua oferta de venda foi publicada com sucesso.", [
				{ text: "Ver minhas ofertas", onPress: () => router.replace("/pages/myOffers") },
			])
		} catch (error) {
			Alert.alert("Erro ao criar oferta", getApiErrorMessage(error))
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<View className="flex-1 bg-white">
			<View
				className="px-5 pt-14 pb-5 rounded-b-3xl"
				style={{ backgroundColor: corPrincipal }}
			>
				<View className="flex-row items-center justify-between">
					<TouchableOpacity onPress={() => router.back()} className="">
						<ChevronLeft color="#fff" size={26} />
					</TouchableOpacity>

					<Text className="text-white font-semibold text-lg">
						Nova Oferta de {offerTypeLabel}
					</Text>

					<TouchableOpacity>
						<Info color="#fff" size={22} />
					</TouchableOpacity>
				</View>
			</View>

			<ScrollView
				className="flex-1 px-5"
				contentContainerStyle={{ paddingTop: 24, paddingBottom: 32 }}
				showsVerticalScrollIndicator={false}
			>
				<Text className="text-gray-900 font-semibold text-base mb-4">
					Informações da oferta
				</Text>

				<View className="mb-4">
					<Text className="text-gray-700 mb-2">Produto</Text>

					<TouchableOpacity className="border border-gray-300 rounded-xl px-4 py-4 flex-row items-center justify-between">
						<Text className="text-gray-900">Açaí in natura</Text>
						<ChevronRight color="#777" size={20} />
					</TouchableOpacity>
				</View>

				<View className="mb-2">
					<Text className="text-gray-700 mb-2">Quantidade</Text>

					<View className="flex-row gap-3">
						<TextInput
							value={quantidade}
							onChangeText={setQuantidade}
							keyboardType="numeric"
							placeholder="0"
							className="flex-1 border border-gray-300 rounded-xl px-4 text-base text-gray-900"
						/>

						<View
							className="rounded-xl overflow-hidden"
							style={{ backgroundColor: corPrincipal }}
						>
							{(["kg", "lata", "tela"] as const).map((item) => (
								<TouchableOpacity
									key={item}
									onPress={() => setUnidade(item)}
									className={`px-6 py-3 ${unidade === item ? "bg-white/20" : ""}`}
								>
									<Text className="text-white font-semibold text-center">
										{UNIDADES[item].label}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>
				</View>
				<Text className="text-gray-500 text-xs mb-6">
					Escolha a unidade que deseja informar
				</Text>

				<View className="mb-4 rounded-xl bg-purple-50 px-4 py-3">
					<Text className="text-sm font-medium text-purple-950">
						Publicação: {displayedOfferDate}
					</Text>
					<Text className="mt-1 text-sm text-purple-800">
						Validade automática: {displayedExpiresAt} ({validityDays} dias)
					</Text>
				</View>
				<View className="mb-2">
					<Text className="text-gray-700 mb-2">Preço</Text>

					<View className="flex-row gap-3 border-gray-300 border rounded-xl px-4 items-center justify-between">
						<View className="flex-1 flex-row items-center">
							<Text className="text-gray-900 text-lg font-bold mr-1">R$</Text>

							<TextInput
								value={formattedPrice}
								onChangeText={handlePriceChange}
								keyboardType="numeric"
								placeholder="0,00"
								className="flex-1 text-lg  font-bold text-gray-900"
							/>
						</View>

						<Text className="text-gray-700 text-base">por kg</Text>
					</View>
				</View>
				<View
					className="rounded-2xl border p-5 mb-5"
					style={{
						borderColor: corPrincipal,
						backgroundColor: unidade === "tela" ? "#F1FAF2" : "#FBF7FF",
					}}
				>
					<Text
						className="font-semibold text-center mb-5"
						style={{ color: corPrincipal }}
					>
						Equivalência automática
					</Text>

					<LinhaEquivalencia
						icon={<Scale color="#fff" size={18} />}
						label="KG"
						valor={`${formatarValor(equivalencia.kg)} kg`}
						cor={corPrincipal}
					/>

					<LinhaEquivalencia
						icon={<Package color="#fff" size={18} />}
						label="LATA"
						valor={`${formatarValor(equivalencia.lata)} latas`}
						cor={corPrincipal}
					/>

					<LinhaEquivalencia
						icon={<Grid3X3 color="#fff" size={18} />}
						label="TELA"
						valor={`${formatarValor(equivalencia.tela)} telas`}
						cor={corPrincipal}
					/>
				</View>

				<View
					className="rounded-xl px-4 py-3 flex-row items-center gap-2"
					style={{
						backgroundColor: unidade === "tela" ? "#EAF7EC" : "#F3EAFB",
					}}
				>
					<Info color={corPrincipal} size={16} />
					<Text className="text-xs" style={{ color: corPrincipal }}>
						1 LATA = 14 kg | 1 TELA = 28 kg
					</Text>
				</View>

				<View className="mt-6">
					<Pressable
						onPress={handleCreateOffer}
						disabled={submitting}
						className={`mt-5 bg-green-600 rounded-xl py-4 flex-row items-center justify-center gap-2 mb-3 ${submitting ? "opacity-60" : ""}`}
					>
						{submitting && <ActivityIndicator color="#FFFFFF" />}
						<Text className="text-white font-bold text-base">
							{submitting ? "Criando oferta..." : `Criar Oferta de ${offerTypeLabel}`}
						</Text>
					</Pressable>
				</View>
			</ScrollView>
		</View>
	)
}

type LinhaProps = {
	icon: React.ReactNode
	label: string
	valor: string
	cor: string
}

function LinhaEquivalencia({ icon, label, valor, cor }: LinhaProps) {
	return (
		<View className="flex-row items-center justify-between mb-4">
			<View className="flex-row items-center gap-3">
				<View
					className="w-9 h-9 rounded-full items-center justify-center"
					style={{ backgroundColor: cor }}
				>
					{icon}
				</View>

				<Text className="font-semibold" style={{ color: cor }}>
					{label}
				</Text>
			</View>

			<Text className="text-2xl font-bold" style={{ color: cor }}>
				{valor}
			</Text>
		</View>
	)
}
