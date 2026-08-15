import { Header } from "@/components/Header"
import { useAuth } from "@/hooks/useAuth"
import { negotiationsApi } from "@/server/negotiations"
import {
	getNegotiationId,
	getNegotiationParties,
	getNegotiationProposer,
	getOfferOwner,
	getOfferOwnerId,
	isSaleOffer,
} from "@/utils/negotiationRoles"
import { Picker } from "@react-native-picker/picker"
import { router, useLocalSearchParams } from "expo-router"
import {
	CalendarClock,
	Check,
	ChevronDown,
	ChevronUp,
	Hash,
	MapPin,
	Package,
	Phone,
	RefreshCw,
	Scale,
	Send,
	Tag,
	UserRound,
	X,
} from "lucide-react-native"
import { useCallback, useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Keyboard, Modal, Platform, Pressable, Text, TextInput, View } from "react-native"
import { KeyboardAwareScrollView, KeyboardProvider } from "react-native-keyboard-controller"
import Toast from "react-native-toast-message"

function parseParam(value?: string | string[]) {
	const raw = Array.isArray(value) ? value[0] : value
	if (!raw) return null
	try {
		return JSON.parse(raw) as Record<string, any>
	} catch {
		return null
	}
}

function apiMessage(error: any) {
	if (error?.response?.status === 404) {
		return "Esta negociação não foi encontrada. Ela pode ter sido removida ou a lista está desatualizada."
	}
	const data = error?.response?.data
	const validation = data?.errors ? Object.values(data.errors).flat().find(Boolean) : null
	return String(validation ?? data?.message ?? "Não foi possível concluir a operação.")
}

function currencyInput(value: string) {
	return (Number(value.replace(/\D/g, "")) / 100).toLocaleString("pt-BR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})
}

function formatDateTime(value?: string | null) {
	if (!value) return null
	const normalized = value.includes("T") ? value : value.replace(" ", "T")
	const date = new Date(normalized)
	if (Number.isNaN(date.getTime())) return value

	return date.toLocaleString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	})
}

function formatMoney(value: unknown) {
	const number = Number(value)
	return Number.isFinite(number) ? `R$ ${number.toFixed(2).replace(".", ",")}` : null
}

function formatNumber(value: unknown) {
	const number = Number(value)
	if (!Number.isFinite(number)) return null
	return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(".", ",")
}

const finalStatuses = ["rejected", "completed", "cancelled", "canceled", "cancelada", "cancelado"]
const unitOptions = [
	{ label: "Quilograma (kg)", value: "kg" },
	{ label: "Lata", value: "lata" },
	{ label: "Tela", value: "tela" },
]

export default function NegotiationScreen() {
	const params = useLocalSearchParams<{
		offer?: string | string[]
		negotiation?: string | string[]
	}>()
	const { user } = useAuth()
	const offer = useMemo(() => parseParam(params.offer), [params.offer])
	const initialNegotiation = useMemo(() => parseParam(params.negotiation), [params.negotiation])
	const [negotiation, setNegotiation] = useState(initialNegotiation)
	const [price, setPrice] = useState(() => String(Math.round(Number(offer?.price ?? 0) * 100)))
	const [volume, setVolume] = useState(() =>
		String(offer?.volume?.original ?? offer?.original_volume ?? ""),
	)
	const [unit, setUnit] = useState(() =>
		String(offer?.volume?.unit ?? offer?.original_unit ?? "kg"),
	)
	const [initialMessage, setInitialMessage] = useState("Tenho interesse nessa oferta.")
	const [message, setMessage] = useState("")
	const [localMessages, setLocalMessages] = useState<any[]>(initialNegotiation?.messages ?? [])
	const [submitting, setSubmitting] = useState(false)
	const [showOfferDetails, setShowOfferDetails] = useState(false)
	const [refreshingMessages, setRefreshingMessages] = useState(false)
	const [numericField, setNumericField] = useState<"price" | "volume" | null>(null)

	const negotiationId = getNegotiationId(negotiation)
	const isCreated = negotiationId !== null
	const status = String(negotiation?.status ?? "pending").toLowerCase()
	const isCancelled = ["cancelled", "canceled", "cancelada", "cancelado"].includes(status)
	const isClosed = finalStatuses.includes(status)
	const canAct = isCreated && !finalStatuses.includes(status)
	const displayedOffer = negotiation?.offer ?? offer ?? {}
	const displayedPrice = Number(negotiation?.proposed_price ?? negotiation?.price)
	const rawDisplayedVolume = negotiation?.proposed_volume ?? negotiation?.volume
	const displayedVolume =
		typeof rawDisplayedVolume === "object" ? rawDisplayedVolume?.original : rawDisplayedVolume
	const displayedUnit =
		negotiation?.proposed_unit ??
		negotiation?.unit ??
		(typeof rawDisplayedVolume === "object" ? rawDisplayedVolume?.unit : undefined) ??
		displayedOffer.volume?.unit
	const currentUserId = Number(user?.id)
	const offerOwnerId = getOfferOwnerId(displayedOffer)
	const { amOwner, amBuyer } = getNegotiationParties(negotiation, currentUserId)
	const creatingOwnOfferNegotiation = !isCreated && offerOwnerId === currentUserId
	const saleOffer = isSaleOffer(displayedOffer)
	const isPending = ["pending", "proposed", "open", "em negociação", "em_negociacao"].includes(
		status,
	)
	const isAccepted = ["accepted", "aceita", "aceito"].includes(status)
	const canReview = isCreated && amOwner && isPending
	const canCancel = isCreated && amBuyer && isPending
	const canComplete = isCreated && amOwner && isAccepted
	const myRoleLabel = amOwner
		? saleOffer
			? "Produtor · vendedor"
			: "Dono da oferta"
		: "Comprador"
	const proposer = getNegotiationProposer(negotiation)
	const offerOwner = getOfferOwner(displayedOffer)
	const counterpart = amOwner ? proposer : offerOwner
	const counterpartName = counterpart?.name
	const proposerMunicipality = proposer?.municipality?.name ?? proposer?.municipality_name
	const proposerState = proposer?.municipality?.state ?? proposer?.state
	const proposerLocality = proposer?.locality?.name ?? proposer?.locality_name
	const proposerPhone = proposer?.phone ?? proposer?.telephone ?? proposer?.whatsapp
	const proposalDate = formatDateTime(
		negotiation?.proposed_at ??
			negotiation?.created_at ??
			negotiation?.dates?.created_at ??
			negotiation?.dates?.proposal_date,
	)
	const offerTypeLabel = saleOffer ? "Oferta de venda" : "Oferta de compra"
	const offerPrice = formatMoney(displayedOffer.price)
	const offerVolume = displayedOffer.volume?.original ?? displayedOffer.original_volume
	const offerUnit = displayedOffer.volume?.unit ?? displayedOffer.original_unit
	const offerKg = formatNumber(displayedOffer.volume?.kg)
	const offerLata = formatNumber(displayedOffer.volume?.lata)
	const offerTela = formatNumber(displayedOffer.volume?.tela)
	const offerMunicipality = displayedOffer.municipality?.name
	const offerState = displayedOffer.municipality?.state
	const offerPublishedAt = formatDateTime(
		displayedOffer.dates?.offer_date ??
			displayedOffer.dates?.created_at ??
			displayedOffer.created_at,
	)
	const offerExpiresAt = formatDateTime(
		displayedOffer.dates?.expires_at ?? displayedOffer.expires_at,
	)
	const offerStatus = displayedOffer.status

	const refreshConversation = useCallback(
		async (showLoading = false) => {
			if (!negotiationId) return

			try {
				if (showLoading) setRefreshingMessages(true)
				const response = await negotiationsApi.list()
				const data = response?.data?.data
				const items = Array.isArray(data)
					? data
					: Array.isArray(data?.data)
						? data.data
						: []
				const updated = items.find(
					(item: Record<string, any>) => getNegotiationId(item) === negotiationId,
				)
				if (!updated) return

				setNegotiation((current) => ({ ...current, ...updated }))
				if (Array.isArray(updated.messages)) setLocalMessages(updated.messages)
			} catch (error: any) {
				if (showLoading) {
					Toast.show({
						type: "error",
						text1: "Não foi possível atualizar",
						text2: apiMessage(error),
					})
				}
			} finally {
				if (showLoading) setRefreshingMessages(false)
			}
		},
		[negotiationId],
	)

	useEffect(() => {
		if (!isCreated || isClosed) return

		void refreshConversation()
		const interval = setInterval(() => void refreshConversation(), 10000)
		return () => clearInterval(interval)
	}, [isClosed, isCreated, refreshConversation])

	async function run(label: string, request: () => Promise<any>) {
		try {
			setSubmitting(true)
			console.log(`[Negociação] ${label}`, {
				...(negotiationId
					? {
							negotiationId,
							sourceIds: {
								id: negotiation?.id,
								negotiation_id: negotiation?.negotiation_id,
								nested_id: negotiation?.negotiation?.id,
							},
						}
					: {}),
			})
			const response = await request()
			const updated = response?.data?.data ?? response?.data
			if (updated && typeof updated === "object")
				setNegotiation((current) => ({ ...current, ...updated }))
			Toast.show({
				type: "success",
				text1: "Sucesso",
				text2: response?.data?.message ?? `${label} realizada com sucesso.`,
			})
			return response
		} catch (error: any) {
			console.error(`[Negociação] Erro: ${label}`, {
				status: error?.response?.status,
				response: error?.response?.data,
			})
			Toast.show({ type: "error", text1: "Erro", text2: apiMessage(error) })
			return null
		} finally {
			setSubmitting(false)
		}
	}

	async function createNegotiation() {
		if (creatingOwnOfferNegotiation) {
			Toast.show({
				type: "info",
				text1: "Esta oferta é sua",
				text2: "Você não pode enviar uma proposta para a própria oferta.",
			})
			return
		}
		const numericPrice = Number(price.replace(/\D/g, "")) / 100
		const numericVolume = Number(volume.replace(",", "."))
		const offerId = Number(offer?.id)
		if (
			!offerId ||
			numericPrice <= 0 ||
			numericVolume <= 0 ||
			!unit.trim() ||
			!initialMessage.trim()
		) {
			Toast.show({
				type: "info",
				text1: "Dados incompletos",
				text2: "Informe preço, volume, unidade e mensagem.",
			})
			return
		}
		const payload = {
			offer_id: offerId,
			proposed_price: numericPrice,
			proposed_volume: numericVolume,
			proposed_unit: unit.trim().toLowerCase(),
			message: initialMessage.trim(),
		}
		console.log("[Negociação] Criando", JSON.stringify(payload))
		const response = await run("Proposta", () => negotiationsApi.create(payload))
		if (response) router.replace("/(tabs)/transaction")
	}

	async function sendMessage() {
		const text = message.trim()
		if (!text || !negotiationId || isCancelled) return
		const response = await run("Mensagem", () =>
			negotiationsApi.sendMessage(negotiationId, text),
		)
		if (response) {
			const created = response?.data?.data ?? {
				id: Date.now(),
				message: text,
				user_id: user?.id,
			}
			setLocalMessages((current) => [...current, created])
			setMessage("")
		}
	}

	async function cancelNegotiation() {
		if (!negotiationId) return
		const response = await run("Cancelamento", () => negotiationsApi.cancel(negotiationId))
		if (response) setNegotiation((current) => ({ ...current, status: "cancelled" }))
	}

	async function updateStatus(label: string, nextStatus: string, request: () => Promise<any>) {
		const response = await run(label, request)
		if (response) setNegotiation((current) => ({ ...current, status: nextStatus }))
	}

	function openNumericField(field: "price" | "volume") {
		Keyboard.dismiss()
		setNumericField(field)
	}

	function typeNumericKey(key: string) {
		if (numericField === "price") {
			if (key === "decimal") return
			setPrice((current) => key === "backspace" ? current.slice(0, -1) : `${current}${key}`.replace(/^0+(?=\d)/, ""))
			return
		}

		if (numericField === "volume") {
			setVolume((current) => {
				if (key === "backspace") return current.slice(0, -1)
				if (key === "decimal") return /[,.]/.test(current) ? current : `${current || "0"},`
				return `${current}${key}`.replace(/^0+(?=\d)/, "")
			})
		}
	}

	return (
		<View className="flex-1 bg-purple-950">
			<Header
				title={isCreated ? (counterpartName ?? "Negociação") : "Enviar proposta"}
				subtitle={
					isCreated
						? `Negociação #${negotiationId ?? "—"} · Oferta #${displayedOffer.id ?? "—"}`
						: `Oferta #${displayedOffer.id ?? offer?.id}`
				}
				showBack
			/>

			<KeyboardProvider>
				<KeyboardAwareScrollView
					className="flex-1 rounded-t-3xl bg-gray-50"
					contentContainerClassName="p-4 pb-24"
					bottomOffset={24}
					disableScrollOnKeyboardHide
					keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<View className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
						<View className="flex-row items-center justify-between gap-3">
							<Text className="text-xs text-gray-500">
								Oferta #{displayedOffer.id ?? offer?.id ?? "—"}
							</Text>
							{isCreated ? (
								<View className="flex-row items-center gap-1 rounded-full bg-purple-100 px-3 py-1">
									<Hash size={13} color="#6B21A8" />
									<Text className="text-xs font-bold text-purple-800">
										Negociação {negotiationId}
									</Text>
								</View>
							) : null}
						</View>
						<Text className="mt-2 text-lg font-bold text-gray-900">
							{displayedOffer.product?.name ?? displayedOffer.product_name ?? "Açaí"}{" "}
							· {offerVolume ?? "—"} {offerUnit ?? ""} ·{" "}
							{offerPrice ?? "Preço não informado"}
						</Text>
						{offerMunicipality ? (
							<View className="mt-2 flex-row items-center gap-1">
								<MapPin size={14} color="#16A34A" />
								<Text className="text-sm text-gray-600">
									{offerMunicipality}
									{offerState ? ` - ${offerState}` : ""}
								</Text>
							</View>
						) : null}
						<Pressable
							onPress={() => setShowOfferDetails((current) => !current)}
							className="mt-3 flex-row items-center justify-center gap-1 border-t border-gray-100 pt-3"
						>
							<Text className="text-sm font-semibold text-purple-700">
								{showOfferDetails
									? "Ocultar detalhes da oferta"
									: "Ver detalhes da oferta"}
							</Text>
							{showOfferDetails ? (
								<ChevronUp size={17} color="#7E22CE" />
							) : (
								<ChevronDown size={17} color="#7E22CE" />
							)}
						</Pressable>
					</View>

					{showOfferDetails ? (
						<>
							<View className="mt-3 rounded-2xl border border-gray-200 bg-white p-4">
								<View className="flex-row items-center gap-2">
									<Tag size={18} color="#512B76" />
									<Text className="text-base font-bold text-gray-900">
										Dados da oferta original
									</Text>
								</View>

								<View className="mt-4 flex-row gap-3">
									<View className="flex-1 rounded-xl bg-purple-50 p-3">
										<Text className="text-xs text-purple-700">
											Preço anunciado
										</Text>
										<Text className="mt-1 text-lg font-bold text-purple-950">
											{offerPrice ?? "Não informado"}
										</Text>
										{offerUnit ? (
											<Text className="text-xs text-purple-700">
												por {String(offerUnit)}
											</Text>
										) : null}
									</View>
									<View className="flex-1 rounded-xl bg-green-50 p-3">
										<Text className="text-xs text-green-700">
											Quantidade anunciada
										</Text>
										<Text className="mt-1 text-lg font-bold text-green-800">
											{offerVolume ?? "—"} {offerUnit ?? ""}
										</Text>
									</View>
								</View>

								{offerKg || offerLata || offerTela ? (
									<View className="mt-3 rounded-xl bg-gray-50 p-3">
										<View className="mb-2 flex-row items-center gap-2">
											<Scale size={15} color="#4B5563" />
											<Text className="text-xs font-semibold uppercase text-gray-600">
												Equivalência
											</Text>
										</View>
										<View className="flex-row">
											<View className="flex-1">
												<Text className="text-xs text-gray-500">
													Quilogramas
												</Text>
												<Text className="mt-1 font-bold text-gray-800">
													{offerKg ? `${offerKg} kg` : "—"}
												</Text>
											</View>
											<View className="flex-1 items-center border-x border-gray-200">
												<Text className="text-xs text-gray-500">Latas</Text>
												<Text className="mt-1 font-bold text-gray-800">
													{offerLata ?? "—"}
												</Text>
											</View>
											<View className="flex-1 items-end">
												<Text className="text-xs text-gray-500">Telas</Text>
												<Text className="mt-1 font-bold text-gray-800">
													{offerTela ?? "—"}
												</Text>
											</View>
										</View>
									</View>
								) : null}

								{offerOwner?.name ? (
									<View className="mt-4 flex-row items-center gap-2">
										<Package size={16} color="#6B7280" />
										<Text className="text-sm text-gray-700">
											{saleOffer ? "Produtor/vendedor" : "Responsável"}:{" "}
											<Text className="font-semibold">{offerOwner.name}</Text>
										</Text>
									</View>
								) : null}
								{offerMunicipality ? (
									<View className="mt-3 flex-row items-center gap-2">
										<MapPin size={16} color="#6B7280" />
										<Text className="text-sm text-gray-700">
											{offerMunicipality}
											{offerState ? ` - ${offerState}` : ""}
										</Text>
									</View>
								) : null}
								{offerPublishedAt ? (
									<View className="mt-3 flex-row items-center gap-2">
										<CalendarClock size={16} color="#6B7280" />
										<Text className="text-sm text-gray-700">
											Publicada em {offerPublishedAt}
										</Text>
									</View>
								) : null}
								{offerExpiresAt ? (
									<View className="mt-3 flex-row items-center gap-2">
										<CalendarClock size={16} color="#6B7280" />
										<Text className="text-sm text-gray-700">
											Válida até {offerExpiresAt}
										</Text>
									</View>
								) : null}
								{offerStatus ? (
									<View className="mt-3 self-start rounded-full bg-gray-100 px-3 py-1">
										<Text className="text-xs font-semibold text-gray-700">
											Situação da oferta: {String(offerStatus)}
										</Text>
									</View>
								) : null}
							</View>

							{isCreated ? (
								<View className="mt-4 rounded-2xl border border-purple-200 bg-purple-50 p-4">
									<Text className="text-xs font-semibold uppercase text-purple-700">
										Seu papel nesta negociação
									</Text>
									<Text className="mt-1 text-lg font-bold text-purple-950">
										{myRoleLabel}
									</Text>
									<Text className="mt-1 text-sm text-purple-800">
										{amOwner
											? isPending
												? "Você recebeu esta proposta e pode aceitar ou recusar."
												: isAccepted
													? "A proposta foi aceita. Você pode concluir a negociação."
													: "Esta negociação não permite novas decisões."
											: isPending
												? "Você enviou esta proposta. Aguarde a decisão do produtor ou cancele a proposta."
												: isAccepted
													? "O produtor aceitou sua proposta."
													: "Acompanhe aqui o resultado da sua proposta."}
									</Text>
									{counterpartName ? (
										<Text className="mt-2 text-xs text-purple-600">
											Negociando com: {counterpartName}
										</Text>
									) : null}
								</View>
							) : null}

							{isCreated && proposer ? (
								<View className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
									<View className="flex-row items-center gap-3">
										<View className="h-11 w-11 items-center justify-center rounded-full bg-green-100">
											<UserRound size={22} color="#15803D" />
										</View>
										<View className="flex-1">
											<Text className="text-xs font-semibold uppercase text-green-700">
												Quem fez a proposta · comprador
											</Text>
											<Text className="mt-1 text-lg font-bold text-gray-900">
												{proposer.name ?? "Comprador"}
											</Text>
											{Number(proposer.id ?? proposer.user_id) ===
											currentUserId ? (
												<Text className="mt-1 self-start rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800">
													Você
												</Text>
											) : null}
										</View>
									</View>

									{proposerPhone ? (
										<View className="mt-4 flex-row items-center gap-2">
											<Phone size={16} color="#6B7280" />
											<Text className="text-sm text-gray-700">
												{proposerPhone}
											</Text>
										</View>
									) : null}
									{proposalDate ? (
										<View className="mt-3 flex-row items-center gap-2">
											<CalendarClock size={16} color="#6B7280" />
											<Text className="text-sm text-gray-700">
												Proposta enviada em {proposalDate}
											</Text>
										</View>
									) : null}
									{proposerMunicipality || proposerLocality ? (
										<View className="mt-3 flex-row items-start gap-2">
											<MapPin size={16} color="#6B7280" />
											<View className="flex-1">
												{proposerMunicipality ? (
													<Text className="text-sm text-gray-700">
														{proposerMunicipality}
														{proposerState ? ` - ${proposerState}` : ""}
													</Text>
												) : null}
												{proposerLocality ? (
													<Text className="mt-0.5 text-xs text-gray-500">
														Localidade: {proposerLocality}
													</Text>
												) : null}
												{proposer.community ? (
													<Text className="mt-0.5 text-xs text-gray-500">
														Comunidade: {proposer.community}
													</Text>
												) : null}
											</View>
										</View>
									) : proposer.community ? (
										<View className="mt-3 flex-row items-center gap-2">
											<MapPin size={16} color="#6B7280" />
											<Text className="text-sm text-gray-700">
												Comunidade: {proposer.community}
											</Text>
										</View>
									) : null}
								</View>
							) : null}
						</>
					) : null}

					{isCancelled ? (
						<View className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
							<Text className="font-bold text-red-700">Negociação cancelada</Text>
							<Text className="mt-1 text-sm text-red-600">
								Esta negociação não está mais ativa.
							</Text>
						</View>
					) : null}

					{!isCreated ? (
						<View className="mt-4 gap-4 rounded-2xl border border-purple-200 bg-white p-4">
							<View className="rounded-xl bg-purple-50 p-3">
								<Text className="text-xs font-semibold uppercase text-purple-700">
									Como funciona
								</Text>
								<Text className="mt-1 font-bold text-purple-950">
									Você é o comprador
								</Text>
								<Text className="mt-1 text-sm text-purple-800">
									Envie preço e quantidade. O produtor pode aceitar ou recusar;
									enquanto estiver pendente, você pode cancelar.
								</Text>
							</View>
							<View>
								<Text className="mb-2 text-gray-700">Preço proposto</Text>
								<Pressable onPress={() => openNumericField("price")} className="flex-row items-center rounded-xl border border-gray-300 px-4 py-3">
									<Text className="font-bold">R$</Text>
									<Text className="flex-1 px-2 text-gray-900">{currencyInput(price)}</Text>
								</Pressable>
							</View>
							<View className="flex-row gap-3">
								<View className="flex-1">
									<Text className="mb-2 text-gray-700">Volume</Text>
									<Pressable onPress={() => openNumericField("volume")} className="rounded-xl border border-gray-300 px-4 py-3">
										<Text className="text-gray-900">{volume || "0"}</Text>
									</Pressable>
								</View>
								<View className="flex-1">
									<Text className="mb-2 text-gray-700">Unidade</Text>
									<View className="overflow-hidden rounded-xl border border-gray-300 bg-white">
										<Picker
											selectedValue={unit}
											onValueChange={(value) => setUnit(String(value))}
											mode="dropdown"
											dropdownIconColor="#374151"
											style={{ height: 50, color: "#111827" }}
										>
											{unit &&
											!unitOptions.some((option) => option.value === unit) ? (
												<Picker.Item label={unit} value={unit} />
											) : null}
											{unitOptions.map((option) => (
												<Picker.Item
													key={option.value}
													label={option.label}
													value={option.value}
												/>
											))}
										</Picker>
									</View>
								</View>
							</View>
							<View>
								<Text className="mb-2 text-gray-700">Mensagem</Text>
								<TextInput
									value={initialMessage}
									onChangeText={setInitialMessage}
									multiline
									className="min-h-24 rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
								/>
							</View>
							<Pressable
								onPress={createNegotiation}
								disabled={submitting || creatingOwnOfferNegotiation}
								className={`flex-row items-center justify-center gap-2 rounded-xl py-4 ${creatingOwnOfferNegotiation ? "bg-gray-300" : "bg-green-600"}`}
							>
								<Send size={18} color="#fff" />
								<Text className="font-bold text-white">
									{creatingOwnOfferNegotiation
										? "Esta oferta é sua"
										: submitting
											? "Enviando..."
											: "Enviar proposta ao produtor"}
								</Text>
							</Pressable>
						</View>
					) : (
						<>
							<View className="mt-5 flex-row items-center justify-between">
								<Text className="text-xs font-bold uppercase text-gray-500">
									Conversa
								</Text>
								<Pressable
									onPress={() => void refreshConversation(true)}
									disabled={refreshingMessages}
									className="flex-row items-center gap-1 rounded-full bg-white px-3 py-2"
								>
									{refreshingMessages ? (
										<ActivityIndicator size="small" color="#6B21A8" />
									) : (
										<RefreshCw size={14} color="#6B21A8" />
									)}
									<Text className="text-xs font-semibold text-purple-800">
										Atualizar
									</Text>
								</Pressable>
							</View>
							<View className="mt-3 gap-3">
								{localMessages.map((item, index) => {
									const text = String(item.message ?? item.text ?? "")
									const fromMe =
										Number(item.user_id ?? item.sender_id ?? item.user?.id) ===
										Number(user?.id)
									return (
										<View
											key={String(item.id ?? index)}
											className={`max-w-[85%] rounded-2xl px-4 py-3 ${fromMe ? "self-end bg-purple-900" : "self-start bg-white"}`}
										>
											<Text
												className={fromMe ? "text-white" : "text-gray-800"}
											>
												{text}
											</Text>
										</View>
									)
								})}
							</View>

							<View className="mt-5 rounded-2xl border border-purple-200 bg-purple-50 p-4">
								<View className="flex-row items-start justify-between gap-3">
									<View className="flex-1">
										<Text className="text-xs font-bold uppercase text-purple-700">
											{amOwner ? "Proposta recebida" : "Sua proposta"}
										</Text>
										<Text className="mt-1 text-2xl font-bold text-purple-950">
											{Number.isFinite(displayedPrice)
												? `R$ ${displayedPrice.toFixed(2).replace(".", ",")} / ${displayedUnit ?? "unidade"}`
												: "Preço não informado"}
										</Text>
										<Text className="mt-1 text-sm font-semibold text-purple-800">
											Quantidade: {displayedVolume ?? "—"}{" "}
											{displayedUnit ?? ""}
										</Text>
									</View>
									<View className="rounded-full bg-white px-3 py-1">
										<Text className="text-xs font-bold text-purple-700">
											{status}
										</Text>
									</View>
								</View>
								{proposalDate ? (
									<View className="mt-3 flex-row items-center gap-1">
										<CalendarClock size={13} color="#7E22CE" />
										<Text className="text-xs text-purple-700">
											Enviada em {proposalDate}
										</Text>
									</View>
								) : null}
								{offerPrice &&
								Number.isFinite(displayedPrice) &&
								Number(displayedOffer.price) !== displayedPrice ? (
									<Text className="mt-2 text-xs text-purple-700">
										Oferta original: {offerPrice} por{" "}
										{String(offerUnit ?? "unidade")}.
									</Text>
								) : null}
							</View>

							{canAct && (canReview || canComplete || canCancel) ? (
								<View className="mt-4 flex-row flex-wrap gap-2">
									{canReview ? (
										<>
											<Pressable
												onPress={() =>
													updateStatus("Aceite", "accepted", () =>
														negotiationsApi.accept(negotiationId),
													)
												}
												disabled={submitting}
												className="min-w-[47%] flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-green-600 py-3"
											>
												<Check size={16} color="#fff" />
												<Text className="font-semibold text-white">
													Aceitar proposta
												</Text>
											</Pressable>
											<Pressable
												onPress={() =>
													updateStatus("Recusa", "rejected", () =>
														negotiationsApi.reject(negotiationId),
													)
												}
												disabled={submitting}
												className="min-w-[47%] flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-red-600 py-3"
											>
												<X size={16} color="#fff" />
												<Text className="font-semibold text-white">
													Recusar proposta
												</Text>
											</Pressable>
										</>
									) : null}
									{canComplete ? (
										<Pressable
											onPress={() =>
												updateStatus("Conclusão", "completed", () =>
													negotiationsApi.complete(negotiationId),
												)
											}
											disabled={submitting}
											className="flex-1 rounded-xl bg-blue-600 py-3"
										>
											<Text className="text-center font-semibold text-white">
												Concluir negociação
											</Text>
										</Pressable>
									) : null}
									{canCancel ? (
										<Pressable
											onPress={cancelNegotiation}
											disabled={submitting}
											className="flex-1 rounded-xl border border-red-400 bg-white py-3"
										>
											<Text className="text-center font-semibold text-red-600">
												Cancelar minha proposta
											</Text>
										</Pressable>
									) : null}
								</View>
							) : null}

							<View
								className={`mt-4 flex-row items-center gap-2 rounded-2xl border border-gray-200 p-2 ${isClosed ? "bg-gray-100" : "bg-white"}`}
							>
								<TextInput
									value={message}
									onChangeText={setMessage}
									placeholder={
										isClosed ? "Negociação encerrada" : "Digite sua mensagem..."
									}
									placeholderTextColor="#9CA3AF"
									editable={!isClosed}
									className={`flex-1 px-3 py-2 ${isClosed ? "text-gray-400" : "text-gray-900"}`}
								/>
								<Pressable
									onPress={sendMessage}
									disabled={isClosed || !message.trim() || submitting}
									className={`h-11 w-11 items-center justify-center rounded-full ${isClosed ? "bg-gray-300" : "bg-purple-900"}`}
								>
									{submitting ? (
										<ActivityIndicator color="#fff" />
									) : (
										<Send size={19} color={isClosed ? "#9CA3AF" : "#fff"} />
									)}
								</Pressable>
							</View>
						</>
					)}
				</KeyboardAwareScrollView>
			</KeyboardProvider>

			<Modal visible={numericField !== null} transparent animationType="slide" onRequestClose={() => setNumericField(null)}>
				<View className="flex-1 justify-end bg-black/40">
					<Pressable className="flex-1" onPress={() => setNumericField(null)} accessibilityLabel="Fechar teclado numérico" />
					<View className="rounded-t-3xl bg-gray-100 px-5 pb-8 pt-4">
						<View className="mb-4 flex-row items-center justify-between">
							<View>
								<Text className="text-sm text-gray-500">{numericField === "price" ? "Preço proposto" : "Volume"}</Text>
								<Text className="mt-1 text-2xl font-bold text-gray-900">{numericField === "price" ? `R$ ${currencyInput(price)}` : volume || "0"}</Text>
							</View>
							<Pressable onPress={() => setNumericField(null)} className="rounded-full bg-purple-900 px-5 py-3">
								<Text className="font-bold text-white">Concluir</Text>
							</Pressable>
						</View>

						<View className="flex-row flex-wrap gap-3">
							{["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((key) => (
								<Pressable key={key} onPress={() => typeNumericKey(key)} className="h-14 w-[30%] flex-grow items-center justify-center rounded-xl bg-white">
									<Text className="text-2xl font-semibold text-gray-900">{key}</Text>
								</Pressable>
							))}
							<Pressable disabled={numericField === "price"} onPress={() => typeNumericKey("decimal")} className={`h-14 w-[30%] flex-grow items-center justify-center rounded-xl ${numericField === "price" ? "bg-gray-200" : "bg-white"}`}>
								<Text className="text-2xl font-semibold text-gray-900">{numericField === "price" ? "" : ","}</Text>
							</Pressable>
							<Pressable onPress={() => typeNumericKey("0")} className="h-14 w-[30%] flex-grow items-center justify-center rounded-xl bg-white">
								<Text className="text-2xl font-semibold text-gray-900">0</Text>
							</Pressable>
							<Pressable onPress={() => typeNumericKey("backspace")} className="h-14 w-[30%] flex-grow items-center justify-center rounded-xl bg-white">
								<Text className="text-xl font-semibold text-gray-900">⌫</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</View>
	)
}
