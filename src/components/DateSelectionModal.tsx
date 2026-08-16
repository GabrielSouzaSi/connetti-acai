import { CalendarDays } from "lucide-react-native"
import { useEffect, useState } from "react"
import { Modal, Pressable, Text, View } from "react-native"
import { Calendar, DateData, LocaleConfig } from "react-native-calendars"

LocaleConfig.locales["pt-BR"] = {
	monthNames: [
		"Janeiro",
		"Fevereiro",
		"Março",
		"Abril",
		"Maio",
		"Junho",
		"Julho",
		"Agosto",
		"Setembro",
		"Outubro",
		"Novembro",
		"Dezembro",
	],
	monthNamesShort: [
		"Jan.",
		"Fev.",
		"Mar.",
		"Abr.",
		"Mai.",
		"Jun.",
		"Jul.",
		"Ago.",
		"Set.",
		"Out.",
		"Nov.",
		"Dez.",
	],
	dayNames: [
		"Domingo",
		"Segunda-feira",
		"Terça-feira",
		"Quarta-feira",
		"Quinta-feira",
		"Sexta-feira",
		"Sábado",
	],
	dayNamesShort: ["Dom.", "Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."],
	today: "Hoje",
}
LocaleConfig.defaultLocale = "pt-BR"

type DateSelectionModalProps = {
	visible: boolean
	initialDate?: Date
	maximumDate?: Date
	onApply: (date: Date) => void
	onCancel: () => void
}

function toIsoDate(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function fromIsoDate(value: string) {
	return new Date(`${value}T12:00:00`)
}

export function DateSelectionModal({
	visible,
	initialDate = new Date(),
	maximumDate = new Date(),
	onApply,
	onCancel,
}: DateSelectionModalProps) {
	const [draftDate, setDraftDate] = useState(() => toIsoDate(initialDate))

	useEffect(() => {
		if (visible) setDraftDate(toIsoDate(initialDate))
	}, [initialDate, visible])

	function selectDate(day: DateData) {
		setDraftDate(day.dateString)
	}

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
			<View className="flex-1 items-center justify-center bg-black/50 px-5">
				<View className="w-full max-w-md rounded-3xl bg-white p-5">
					<View className="mb-3 flex-row items-center gap-3">
						<View className="h-11 w-11 items-center justify-center rounded-full bg-purple-100">
							<CalendarDays size={22} color="#512B76" />
						</View>
						<View className="flex-1">
							<Text className="text-xl font-bold text-gray-900">Selecionar data</Text>
							<Text className="text-sm text-gray-500">
								Consulte a média de um dia específico
							</Text>
						</View>
					</View>

					<Calendar
						current={draftDate}
						maxDate={toIsoDate(maximumDate)}
						firstDay={1}
						enableSwipeMonths
						hideExtraDays
						onDayPress={selectDate}
						markedDates={{
							[draftDate]: {
								selected: true,
								selectedColor: "#512B76",
								selectedTextColor: "#FFFFFF",
							},
						}}
						theme={{
							calendarBackground: "#FFFFFF",
							backgroundColor: "#FFFFFF",
							monthTextColor: "#3B0A5F",
							textMonthFontSize: 18,
							textMonthFontWeight: "700",
							arrowColor: "#512B76",
							todayTextColor: "#7C3AED",
							dayTextColor: "#1F2937",
							textDisabledColor: "#D1D5DB",
							textSectionTitleColor: "#6B7280",
							selectedDayBackgroundColor: "#512B76",
							selectedDayTextColor: "#FFFFFF",
						}}
					/>

					<Text className="mt-2 text-center text-sm font-medium text-purple-900">
						Data selecionada: {fromIsoDate(draftDate).toLocaleDateString("pt-BR")}
					</Text>

					<View className="mt-5 flex-row gap-3">
						<Pressable
							onPress={onCancel}
							className="flex-1 items-center rounded-xl border border-gray-300 py-3.5"
						>
							<Text className="font-semibold text-gray-700">Cancelar</Text>
						</Pressable>
						<Pressable
							onPress={() => onApply(fromIsoDate(draftDate))}
							className="flex-1 items-center rounded-xl bg-purple-950 py-3.5"
						>
							<Text className="font-semibold text-white">Aplicar</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	)
}
