import { Header } from "@/components/Header"
import { AcaiOffer } from "@/components/AcaiCard"
import { Filter, Search, X } from "lucide-react-native"
import { useState } from "react"
import { Image, Modal, Pressable, Text, TextInput, View } from "react-native"

export type OfferTypeFilter = "all" | "sell" | "buy"

function normalize(value: unknown) {
	return String(value ?? "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLocaleLowerCase("pt-BR")
}

export function filterOffers(offers: AcaiOffer[], query: string, typeFilter: OfferTypeFilter) {
	const normalizedQuery = normalize(query.trim())

	return offers.filter((offer) => {
		if (typeFilter !== "all" && offer.type !== typeFilter) return false
		if (!normalizedQuery) return true

		const searchableValues = [
			offer.municipality?.name,
			offer.municipality?.state,
			offer.user?.name,
			offer.type === "sell" ? "venda vender" : "compra comprar",
			offer.status,
			offer.price,
			offer.volume?.original,
			offer.volume?.unit,
		]

		return searchableValues.some((value) => normalize(value).includes(normalizedQuery))
	})
}

type OfferExplorerHeaderProps = {
	query: string
	onQueryChange: (query: string) => void
	typeFilter: OfferTypeFilter
	onTypeFilterChange: (filter: OfferTypeFilter) => void
}

const typeOptions: Array<{ value: OfferTypeFilter; label: string }> = [
	{ value: "all", label: "Todas as ofertas" },
	{ value: "sell", label: "Ofertas de venda" },
	{ value: "buy", label: "Ofertas de compra" },
]

export function OfferExplorerHeader({
	query,
	onQueryChange,
	typeFilter,
	onTypeFilterChange,
}: OfferExplorerHeaderProps) {
	const [searchVisible, setSearchVisible] = useState(false)
	const [filterVisible, setFilterVisible] = useState(false)

	function closeSearch() {
		onQueryChange("")
		setSearchVisible(false)
	}

	return (
		<>
			<Header
				centerContent={
					<Image
						className="h-12 w-36"
						source={require("@/assets/logo.png")}
						resizeMode="contain"
					/>
				}
				rightAction={
					<View className="flex-row gap-2">
						<Pressable
							onPress={() => setSearchVisible((visible) => !visible)}
							accessibilityRole="button"
							accessibilityLabel="Pesquisar ofertas"
							className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
						>
							<Search size={21} color="#FFFFFF" />
						</Pressable>
						<Pressable
							onPress={() => setFilterVisible(true)}
							accessibilityRole="button"
							accessibilityLabel="Filtrar ofertas"
							className="relative h-10 w-10 items-center justify-center rounded-full bg-white/15"
						>
							<Filter size={21} color="#FFFFFF" />
							{typeFilter !== "all" ? (
								<View className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border border-white bg-green-400" />
							) : null}
						</Pressable>
					</View>
				}
			>
				{searchVisible ? (
					<View className="flex-row items-center rounded-2xl bg-white px-4">
						<Search size={19} color="#6B7280" />
						<TextInput
							value={query}
							onChangeText={onQueryChange}
							placeholder="Município, produtor, tipo..."
							placeholderTextColor="#9CA3AF"
							autoFocus
							returnKeyType="search"
							className="flex-1 px-3 py-3 text-gray-900"
						/>
						<Pressable
							onPress={closeSearch}
							accessibilityRole="button"
							accessibilityLabel="Fechar pesquisa"
							className="h-8 w-8 items-center justify-center"
						>
							<X size={19} color="#6B7280" />
						</Pressable>
					</View>
				) : null}
			</Header>

			<Modal
				visible={filterVisible}
				transparent
				animationType="fade"
				onRequestClose={() => setFilterVisible(false)}
			>
				<Pressable
					onPress={() => setFilterVisible(false)}
					className="flex-1 justify-end bg-black/40"
				>
					<Pressable
						onPress={(event) => event.stopPropagation()}
						className="rounded-t-3xl bg-white px-5 pb-10 pt-5"
					>
						<View className="mb-5 flex-row items-center justify-between">
							<Text className="text-xl font-bold text-gray-900">Filtrar ofertas</Text>
							<Pressable
								onPress={() => setFilterVisible(false)}
								accessibilityRole="button"
								accessibilityLabel="Fechar filtros"
								className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
							>
								<X size={20} color="#374151" />
							</Pressable>
						</View>

						{typeOptions.map((option) => {
							const selected = typeFilter === option.value
							return (
								<Pressable
									key={option.value}
									onPress={() => {
										onTypeFilterChange(option.value)
										setFilterVisible(false)
									}}
									className={`mb-3 flex-row items-center justify-between rounded-2xl border p-4 ${selected ? "border-purple-700 bg-purple-50" : "border-gray-200 bg-white"}`}
								>
									<Text
										className={
											selected
												? "font-semibold text-purple-900"
												: "text-gray-700"
										}
									>
										{option.label}
									</Text>
									<View
										className={`h-5 w-5 items-center justify-center rounded-full border ${selected ? "border-purple-700" : "border-gray-300"}`}
									>
										{selected ? (
											<View className="h-3 w-3 rounded-full bg-purple-700" />
										) : null}
									</View>
								</Pressable>
							)
						})}
					</Pressable>
				</Pressable>
			</Modal>
		</>
	)
}
