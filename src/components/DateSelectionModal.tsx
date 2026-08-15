import DateTimePicker, {
	DateTimePickerAndroid,
	DateTimePickerEvent,
} from "@react-native-community/datetimepicker"
import { CalendarDays } from "lucide-react-native"
import { useEffect, useState } from "react"
import { Modal, Platform, Pressable, Text, View } from "react-native"

type DateSelectionModalProps = {
	visible: boolean
	initialDate?: Date
	maximumDate?: Date
	onApply: (date: Date) => void
	onCancel: () => void
}

export function DateSelectionModal({
	visible,
	initialDate = new Date(),
	maximumDate = new Date(),
	onApply,
	onCancel,
}: DateSelectionModalProps) {
	const [draftDate, setDraftDate] = useState(initialDate)

	useEffect(() => {
		if (!visible) return
		setDraftDate(initialDate)

		if (Platform.OS === "android") {
			DateTimePickerAndroid.open({
				value: initialDate,
				mode: "date",
				maximumDate,
				onChange: handleChange,
			})
		}
	}, [initialDate, visible])

	function handleChange(event: DateTimePickerEvent, date?: Date) {
		if (event.type !== "dismissed" && date) setDraftDate(date)
	}

	function openAndroidCalendar() {
		DateTimePickerAndroid.open({
			value: draftDate,
			mode: "date",
			maximumDate,
			onChange: handleChange,
		})
	}

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
			<View className="flex-1 items-center justify-center bg-black/50 px-5">
				<View className="w-full max-w-md rounded-3xl bg-white p-5">
					<View className="mb-4 flex-row items-center gap-3">
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

					{Platform.OS === "android" ? (
						<Pressable
							onPress={openAndroidCalendar}
							className="items-center rounded-2xl border border-purple-200 bg-purple-50 p-5"
						>
							<Text className="text-sm text-purple-700">Data selecionada</Text>
							<Text className="mt-1 text-2xl font-bold text-purple-950">
								{draftDate.toLocaleDateString("pt-BR")}
							</Text>
							<Text className="mt-2 text-sm font-semibold text-purple-700">
								Alterar data
							</Text>
						</Pressable>
					) : (
						<DateTimePicker
							value={draftDate}
							mode="date"
							display="inline"
							maximumDate={maximumDate}
							locale="pt-BR"
							onChange={handleChange}
						/>
					)}

					<View className="mt-5 flex-row gap-3">
						<Pressable
							onPress={onCancel}
							className="flex-1 items-center rounded-xl border border-gray-300 py-3.5"
						>
							<Text className="font-semibold text-gray-700">Cancelar</Text>
						</Pressable>
						<Pressable
							onPress={() => onApply(draftDate)}
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
