import { DateSelectionModal } from "@/components/DateSelectionModal"
import { PricePeriod } from "@/utils/priceAnalytics"
import { Check, X } from "lucide-react-native"
import { useState } from "react"
import { Modal, Pressable, ScrollView, Text, View } from "react-native"

export const periodOptions: Array<{ value: PricePeriod; label: string }> = [
	{ value: 7, label: "7 dias" },
	{ value: 30, label: "30 dias" },
	{ value: 90, label: "90 dias" },
	{ value: 0, label: "Todo o período" },
]

type Props = {
	visible: boolean
	municipalities: string[]
	municipality: string
	period?: PricePeriod
	onMunicipalityChange: (value: string) => void
	onPeriodChange?: (value: PricePeriod) => void
	selectedDate?: string | null
	onDateChange?: (value: string | null) => void
	showPeriodFilter?: boolean
	onClose: () => void
}

function toIsoDate(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function parseDate(value?: string | null) {
	if (!value) return new Date()
	const parsed = new Date(`${value}T12:00:00`)
	return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function formatDate(value?: string | null) {
	return value ? parseDate(value).toLocaleDateString("pt-BR") : "Selecionar uma data"
}

export function PriceFiltersModal(props: Props) {
	const [datePickerVisible, setDatePickerVisible] = useState(false)
	const options = [
		{ value: "all", label: "Todos os municípios" },
		...props.municipalities.map((value) => ({ value, label: value })),
	]

	function close() {
		setDatePickerVisible(false)
		props.onClose()
	}

	return (
		<>
			<Modal visible={props.visible} transparent animationType="slide" onRequestClose={close}>
				<Pressable className="flex-1 justify-end bg-black/40" onPress={close}>
					<Pressable
						className="max-h-[80%] rounded-t-3xl bg-white px-5 pb-10 pt-5"
						onPress={(event) => event.stopPropagation()}
					>
						<View className="mb-4 flex-row items-center justify-between">
							<Text className="text-xl font-bold text-zinc-900">
								Filtros de preço
							</Text>
							<Pressable
								onPress={close}
								className="h-9 w-9 items-center justify-center rounded-full bg-zinc-100"
								accessibilityLabel="Fechar filtros"
							>
								<X size={20} color="#3f3f46" />
							</Pressable>
						</View>
						<ScrollView showsVerticalScrollIndicator={false}>
							<Text className="mb-2 font-semibold text-zinc-700">Município</Text>
							{options.map((option) => (
								<Option
									key={option.value}
									label={option.label}
									selected={props.municipality === option.value}
									onPress={() => props.onMunicipalityChange(option.value)}
								/>
							))}
							{props.showPeriodFilter !== false ? (
								<Text className="mb-2 mt-4 font-semibold text-zinc-700">
									Período
								</Text>
							) : null}
							{props.showPeriodFilter !== false
								? periodOptions.map((option) => (
										<Option
											key={option.value}
											label={option.label}
											selected={
												!props.selectedDate && props.period === option.value
											}
											onPress={() => {
												props.onDateChange?.(null)
												props.onPeriodChange?.(option.value)
											}}
										/>
									))
								: null}
							{props.showPeriodFilter !== false ? (
								<Option
									label={
										props.selectedDate
											? `Data: ${formatDate(props.selectedDate)}`
											: "Data específica"
									}
									selected={Boolean(props.selectedDate)}
									onPress={() => setDatePickerVisible(true)}
								/>
							) : null}
						</ScrollView>
						<Pressable
							onPress={close}
							className="mt-5 items-center rounded-xl bg-purple-950 py-4"
						>
							<Text className="font-bold text-white">Aplicar filtros</Text>
						</Pressable>
					</Pressable>
				</Pressable>
			</Modal>
			<DateSelectionModal
				visible={datePickerVisible}
				initialDate={parseDate(props.selectedDate)}
				maximumDate={new Date()}
				onApply={(date) => {
					props.onDateChange?.(toIsoDate(date))
					setDatePickerVisible(false)
				}}
				onCancel={() => setDatePickerVisible(false)}
			/>
		</>
	)
}

function Option({
	label,
	selected,
	onPress,
}: {
	label: string
	selected: boolean
	onPress: () => void
}) {
	return (
		<Pressable
			onPress={onPress}
			className={`mb-2 flex-row items-center justify-between rounded-xl border p-3 ${selected ? "border-purple-700 bg-purple-50" : "border-zinc-200"}`}
		>
			<Text className={selected ? "font-semibold text-purple-900" : "text-zinc-700"}>
				{label}
			</Text>
			{selected ? <Check size={18} color="#6d28d9" /> : null}
		</Pressable>
	)
}
