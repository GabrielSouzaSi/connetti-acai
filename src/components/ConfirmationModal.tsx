import { AlertTriangle } from "lucide-react-native"
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native"

type ConfirmationModalProps = {
	visible: boolean
	title: string
	message: string
	confirmLabel?: string
	cancelLabel?: string
	destructive?: boolean
	loading?: boolean
	onConfirm: () => void | Promise<void>
	onCancel: () => void
}

export function ConfirmationModal({
	visible,
	title,
	message,
	confirmLabel = "Confirmar",
	cancelLabel = "Voltar",
	destructive = false,
	loading = false,
	onConfirm,
	onCancel,
}: ConfirmationModalProps) {
	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			statusBarTranslucent
			onRequestClose={loading ? undefined : onCancel}
		>
			<View className="flex-1 items-center justify-center bg-black/50 px-6">
				<View className="w-full max-w-md rounded-3xl bg-white p-6">
					<View
						className={`mb-4 h-14 w-14 items-center justify-center rounded-full ${destructive ? "bg-red-100" : "bg-purple-100"}`}
					>
						<AlertTriangle size={28} color={destructive ? "#DC2626" : "#512B76"} />
					</View>

					<Text className="text-xl font-bold text-gray-900">{title}</Text>
					<Text className="mt-2 leading-5 text-gray-600">{message}</Text>

					<View className="mt-6 flex-row gap-3">
						<Pressable
							onPress={onCancel}
							disabled={loading}
							accessibilityRole="button"
							className="flex-1 items-center rounded-xl border border-gray-300 bg-white py-3.5"
						>
							<Text className="font-semibold text-gray-700">{cancelLabel}</Text>
						</Pressable>

						<Pressable
							onPress={onConfirm}
							disabled={loading}
							accessibilityRole="button"
							className={`flex-1 flex-row items-center justify-center rounded-xl py-3.5 ${destructive ? "bg-red-600" : "bg-purple-900"} ${loading ? "opacity-70" : ""}`}
						>
							{loading ? (
								<ActivityIndicator size="small" color="#FFFFFF" />
							) : (
								<Text className="font-semibold text-white">{confirmLabel}</Text>
							)}
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	)
}
