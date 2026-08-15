import { Header } from "@/components/Header"
import { API_URL } from "@/config/env"
import { useAccess } from "@/hooks/useAccess"
import { useAuth } from "@/hooks/useAuth"
import { server } from "@/server/api"
import axios from "axios"
import { router, useLocalSearchParams } from "expo-router"
import { ChevronRight, Grid3X3, Info, Package, Scale } from "lucide-react-native"
import React, { useEffect, useMemo, useState } from "react"
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native"
import Toast from "react-native-toast-message"

const COLORS = {
	primary: "#3B0A5F",
	green: "#2E7D32",
	background: "#F8F5FA",
}

const UNIT_KG: Record<string, number> = {
	kg: 1,
	lata: 14,
	tela: 28,
}

const formatCurrency = (value: string) => {
	const numericValue = value.replace(/\D/g, "")

	const number = Number(numericValue) / 100

	return number.toLocaleString("pt-BR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})
}

const centsToReais = (value: string) => {
	const cents = Number(value || "0")
	return Number((cents / 100).toFixed(2))
}

type Product = {
	id: number
	name: string
	description: string | null
	is_active: boolean
}

type ProductsResponse = {
	message: string
	data: Product[]
}

type OfferOption = {
	id: number
	value: string
	label: string
	description: string | null
}

type OfferOptionsResponse = {
	message: string
	data: OfferOption[]
}

function findOfferType(options: OfferOption[], isBuyer: boolean) {
	const aliases = isBuyer
		? ["buyer", "buy", "comprador"]
		: ["seller", "sell", "vendedor", "producer", "produtor"]

	return options.find((option) => {
		const value = option.value.trim().toLocaleLowerCase("pt-BR")
		const label = option.label.trim().toLocaleLowerCase("pt-BR")

		return aliases.includes(value) || aliases.includes(label)
	})
}

function getApiErrorMessage(
	error: unknown,
	fallback = "Não foi possível criar a oferta. Tente novamente.",
) {
	if (!axios.isAxiosError(error)) return fallback

	const responseData = error.response?.data as
		| { message?: string; errors?: Record<string, string[]> }
		| undefined
	const fieldError = responseData?.errors
		? Object.entries(responseData.errors).find(([, messages]) => messages.length > 0)
		: undefined
	const fieldMessage = fieldError?.[1][0]
	const message = fieldMessage ?? responseData?.message

	if (message === "validation.integer") {
		const fieldLabels: Record<string, string> = {
			user_id: "usuário",
			type: "tipo da oferta",
			product_id: "produto",
			volume: "quantidade",
			unit: "unidade",
			original_volume: "quantidade",
			original_unit: "unidade",
		}
		const fieldLabel = fieldLabels[fieldError?.[0] ?? ""] ?? "campo informado"

		return `O valor de ${fieldLabel} deve ser um número inteiro.`
	}

	return message ?? fallback
}

export default function NovaOferta() {
	const { offer } = useLocalSearchParams()
	const { is } = useAccess()
	const { user } = useAuth()
	const [quantidade, setQuantidade] = useState("10")
	const [price, setPrice] = useState("0.00")
	const [products, setProducts] = useState<Product[]>([])
	const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
	const [offerUnits, setOfferUnits] = useState<OfferOption[]>([])
	const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null)
	const [selectedOfferTypeId, setSelectedOfferTypeId] = useState<number | null>(null)
	const [productsLoading, setProductsLoading] = useState(true)
	const [productsError, setProductsError] = useState("")
	const [showProducts, setShowProducts] = useState(false)
	const [submitting, setSubmitting] = useState(false)
	const isBuyOffer = is("buyer")
	const isSellOffer = is("producer")
	const offerTypeLabel = isBuyOffer ? "Compra" : "Venda"
	const offerEndpoint = isBuyOffer ? "/offers/buy" : "/offers/sell"
	const editingOffer = useMemo(() => {
		if (!offer) return null

		try {
			return JSON.parse(String(offer)) as Record<string, any>
		} catch {
			return null
		}
	}, [offer])
	const editingOfferId = Number(editingOffer?.id)
	const isEditing = Number.isInteger(editingOfferId) && editingOfferId > 0
	const selectedProduct = products.find((product) => product.id === selectedProductId)
	const selectedUnit = offerUnits.find((unit) => unit.id === selectedUnitId)

	const corPrincipal = selectedUnit?.value === "tela" ? COLORS.green : COLORS.primary
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
		const totalKg = valor * (UNIT_KG[selectedUnit?.value ?? ""] ?? 1)

		return {
			kg: totalKg,
			lata: totalKg / 14,
			tela: totalKg / 28,
		}
	}, [quantidade, selectedUnit?.value])

	function formatarValor(valor: number) {
		return Number.isInteger(valor) ? String(valor) : valor.toFixed(1).replace(".", ",")
	}

	useEffect(() => {
		if (!editingOffer) return

		setQuantidade(
			String(editingOffer.original_volume ?? editingOffer.volume?.original ?? ""),
		)
		setPrice(String(Math.round(Number(editingOffer.price) * 100)))
		setSelectedProductId(
			Number(editingOffer.product_id ?? editingOffer.product?.id) || null,
		)
	}, [editingOffer])

	useEffect(() => {
		async function loadOfferOptions() {
			try {
				setProductsLoading(true)
				setProductsError("")
				const [productsResponse, unitsResponse, typesResponse] = await Promise.all([
					server.get<ProductsResponse>("/products"),
					server.get<OfferOptionsResponse>("/offer_units"),
					server.get<OfferOptionsResponse>("/offer_types"),
				])
				const activeProducts = productsResponse.data.data.filter(
					(product) => product.is_active,
				)
				const units = unitsResponse.data.data
				const offerTypes = typesResponse.data.data
				const offerType = findOfferType(offerTypes, isBuyOffer)
				//console.log("units", unitsResponse.data.data)
				console.log("[Oferta] Opções carregadas", {
					profile: isBuyOffer ? "buyer" : "producer",
					types: offerTypes,
					units,
					selectedType: offerType ?? null,
				})

				setProducts(activeProducts)
				setOfferUnits(units)
				setSelectedProductId((current) => current ?? activeProducts[0]?.id ?? null)
				setSelectedUnitId((current) => {
					if (current) return current

					const editingUnit = editingOffer?.original_unit ?? editingOffer?.volume?.unit
					const numericUnitId = Number(editingUnit)
					if (Number.isInteger(numericUnitId) && numericUnitId > 0) return numericUnitId

					const unitValue = String(editingUnit ?? "").toLocaleLowerCase("pt-BR")
					return units.find((unit) => unit.value.toLocaleLowerCase("pt-BR") === unitValue)?.id ?? units[0]?.id ?? null
				})
				setSelectedOfferTypeId(offerType?.id ?? null)
			} catch (error) {
				setProductsError(
					getApiErrorMessage(error, "Não foi possível carregar as opções da oferta."),
				)
			} finally {
				setProductsLoading(false)
			}
		}

		loadOfferOptions()
	}, [editingOffer, isBuyOffer])

	async function handleCreateOffer() {
		if (!isSellOffer && !isBuyOffer) {
			Toast.show({ type: "info", text1: "Perfil necessário", text2: "A criação de ofertas está disponível para produtores e compradores." })
			return
		}

		const volume = Number(quantidade.replace(",", "."))
		const numericPrice = centsToReais(price)

		if (!user?.id) {
			Toast.show({ type: "error", text1: "Sessão inválida", text2: "Entre novamente para criar uma oferta." })
			return
		}

		if (!isEditing && !selectedProductId) {
			Toast.show({ type: "info", text1: "Produto necessário", text2: "Selecione o produto que deseja vender." })
			return
		}

		if (!selectedUnitId || !selectedUnit || (!isEditing && !selectedOfferTypeId)) {
			Toast.show({ type: "error", text1: "Opções indisponíveis", text2: "Não foi possível identificar o tipo ou a unidade da oferta." })
			return
		}

		if (!Number.isInteger(volume) || volume <= 0) {
			Toast.show({ type: "info", text1: "Quantidade inválida", text2: "Informe uma quantidade inteira maior que zero." })
			return
		}

		if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
			Toast.show({ type: "info", text1: "Dados incompletos", text2: "Informe quantidade e preço maiores que zero." })
			return
		}

		try {
			setSubmitting(true)

			if (isEditing) {
				const priceEndpoint = `/offers/${editingOfferId}/price`
				const volumeEndpoint = `/offers/${editingOfferId}/volume`
				const pricePayload = { price: numericPrice }
				const volumePayload = {
					volume,
					unit: selectedUnit.value,
				}

				console.log(
					"[Oferta] Atualizando oferta",
					JSON.stringify({
						requests: [
							{ url: `${API_URL}${priceEndpoint}`, payload: pricePayload },
							{ url: `${API_URL}${volumeEndpoint}`, payload: volumePayload },
						],
					}),
				)

				await server.patch(priceEndpoint, pricePayload)
				await server.patch(volumeEndpoint, volumePayload)
			} else {
				const payload = {
					user_id: user.id,
					type: selectedOfferTypeId,
					product_id: selectedProductId,
					price: numericPrice,
					original_volume: volume,
					original_unit: selectedUnitId,
				}

				console.log("[Oferta] Enviando requisição", {
					action: "create",
					url: `${API_URL}${offerEndpoint}`,
					endpoint: offerEndpoint,
					payload,
				})

				await server.post(offerEndpoint, payload)
			}

			Toast.show({
				type: "success",
				text1: isEditing ? "Oferta atualizada" : "Oferta criada",
				text2: isEditing
					? "As alterações da oferta foram salvas com sucesso."
					: `Sua oferta de ${offerTypeLabel.toLowerCase()} foi publicada com sucesso.`,
			})
			router.replace("/pages/myOffers")
		} catch (error) {
			if (axios.isAxiosError(error)) {
				console.error("[Oferta] Erro na requisição", {
					action: isEditing ? "update" : "create",
					url: error.config?.url,
					method: error.config?.method,
					payload: error.config?.data,
					status: error.response?.status,
					response: error.response?.data,
				})
			}

			Toast.show({
				type: "error",
				text1: isEditing ? "Erro ao atualizar oferta" : "Erro ao criar oferta",
				text2: getApiErrorMessage(
					error,
					isEditing
						? "Não foi possível atualizar a oferta. Tente novamente."
						: "Não foi possível criar a oferta. Tente novamente.",
				),
			})
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<View className="flex-1 bg-white">
			<Header
				title={`${isEditing ? "Editar" : "Nova"} Oferta de ${offerTypeLabel}`}
				showBack
				backgroundColor={corPrincipal}
				rightAction={<TouchableOpacity accessibilityRole="button" accessibilityLabel="Informações da oferta"><Info color="#fff" size={22} /></TouchableOpacity>}
			/>

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

					<TouchableOpacity
						onPress={() => setShowProducts((current) => !current)}
						disabled={isEditing || productsLoading || products.length === 0}
						className={`border border-gray-300 rounded-xl px-4 py-4 flex-row items-center justify-between ${isEditing ? "bg-gray-100 opacity-70" : ""}`}
					>
						<Text className={selectedProduct ? "text-gray-900" : "text-gray-500"}>
							{productsLoading
								? "Carregando produtos..."
								: (selectedProduct?.name ?? "Nenhum produto disponível")}
						</Text>
						<ChevronRight color="#777" size={20} />
					</TouchableOpacity>
					{isEditing ? (
						<Text className="mt-2 text-xs text-gray-500">
							O produto não pode ser alterado durante a edição.
						</Text>
					) : null}

					{productsError ? (
						<Text className="mt-2 text-sm text-red-500">{productsError}</Text>
					) : null}

					{showProducts ? (
						<View className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white">
							{products.map((product, index) => (
								<Pressable
									key={product.id}
									onPress={() => {
										setSelectedProductId(product.id)
										setShowProducts(false)
									}}
									className={`px-4 py-3 ${
										index < products.length - 1
											? "border-b border-gray-100"
											: ""
									} ${selectedProductId === product.id ? "bg-purple-50" : ""}`}
								>
									<Text className="font-medium text-gray-900">
										{product.name}
									</Text>
									{product.description ? (
										<Text className="mt-1 text-xs text-gray-500">
											{product.description}
										</Text>
									) : null}
								</Pressable>
							))}
						</View>
					) : null}
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
							{offerUnits.map((unit) => (
								<TouchableOpacity
									key={unit.id}
									onPress={() => setSelectedUnitId(unit.id)}
									className={`px-6 py-3 ${
										selectedUnitId === unit.id ? "bg-white/20" : ""
									}`}
								>
									<Text className="text-white font-semibold text-center">
										{unit.label}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>
				</View>
				<Text className="text-gray-500 text-xs mb-6">
					Escolha a unidade que deseja informar
				</Text>

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

						<Text className="text-gray-700 text-base">
							por {selectedUnit?.label.toLowerCase() ?? "unidade"}
						</Text>
					</View>
				</View>
				<View
					className="rounded-2xl border p-5 mb-5"
					style={{
						borderColor: corPrincipal,
						backgroundColor: selectedUnit?.value === "tela" ? "#F1FAF2" : "#FBF7FF",
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
						backgroundColor: selectedUnit?.value === "tela" ? "#EAF7EC" : "#F3EAFB",
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
						disabled={submitting || productsLoading}
						className={`mt-5 bg-green-600 rounded-xl py-4 flex-row items-center justify-center gap-2 mb-3 ${submitting || productsLoading ? "opacity-60" : ""}`}
					>
						{submitting && <ActivityIndicator color="#FFFFFF" />}
						<Text className="text-white font-bold text-base">
							{submitting
								? isEditing
									? "Salvando alterações..."
									: "Criando oferta..."
								: isEditing
									? "Salvar alterações"
									: `Criar Oferta de ${offerTypeLabel}`}
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
