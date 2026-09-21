import { router } from "expo-router"
import { Crown, X } from "lucide-react-native"
import { Modal, Pressable, Text, View } from "react-native"

export function UpgradePlanModal({
	visible,
	onClose,
	title = "Detalhes exclusivos para assinantes",
	description = "Assine um de nossos planos para acessar os detalhes completos desta oferta e outros recursos exclusivos.",
}: {
	visible: boolean
	onClose: () => void
	title?: string
	description?: string
}) {
	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			statusBarTranslucent
			onRequestClose={onClose}
		>
			<View className="flex-1 items-center justify-center bg-black/50 px-6">
				<View className="w-full max-w-md rounded-3xl bg-white p-6">
					<Pressable
						onPress={onClose}
						accessibilityRole="button"
						accessibilityLabel="Fechar"
						className="absolute right-4 top-4 z-10 h-9 w-9 items-center justify-center rounded-full bg-gray-100"
					>
						<X size={19} color="#4B5563" />
					</Pressable>

					<View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-purple-100">
						<Crown size={28} color="#512B76" />
					</View>

					<Text className="pr-8 text-xl font-bold text-gray-900">{title}</Text>
					<Text className="mt-2 leading-5 text-gray-600">{description}</Text>

					<Pressable
						onPress={() => {
							onClose()
							router.push("/pages/plans")
						}}
						accessibilityRole="button"
						className="mt-6 flex-row items-center justify-center gap-2 rounded-xl bg-purple-900 py-3.5"
					>
						<Crown size={18} color="#FFFFFF" />
						<Text className="font-semibold text-white">Conhecer os planos</Text>
					</Pressable>

					<Pressable
						onPress={onClose}
						accessibilityRole="button"
						className="mt-3 items-center rounded-xl border border-gray-300 py-3.5"
					>
						<Text className="font-semibold text-gray-700">Agora não</Text>
					</Pressable>
				</View>
			</View>
		</Modal>
	)
}
