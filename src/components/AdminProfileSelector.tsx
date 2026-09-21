import { useAccess } from "@/hooks/useAccess"
import { useAuth } from "@/hooks/useAuth"
import { Modal, Pressable, Text, View } from "react-native"

export function AdminProfileSelector({ required = false }: { required?: boolean }) {
	const { isAdmin } = useAccess()
	const { activeProfile, selectProfile } = useAuth()
	if (!isAdmin || (required && activeProfile)) return null

	const content = (
		<View className="rounded-2xl bg-white p-5 mx-5 my-4">
			<Text className="text-lg font-bold text-gray-900">Usar como</Text>
			<Text className="text-gray-500 mt-1 mb-4">Administrador: escolha seu perfil de acesso.</Text>
			{([
				["buyer", "Comprador"],
				["producer", "Vendedor (produtor)"],
			] as const).map(([profile, label]) => (
				<Pressable
					key={profile}
					accessibilityRole="button"
					accessibilityState={{ selected: activeProfile === profile }}
					onPress={() => selectProfile(profile)}
					className={`rounded-xl p-4 mt-2 ${activeProfile === profile ? "bg-purple-800" : "bg-purple-100"}`}
				>
					<Text className={`font-semibold ${activeProfile === profile ? "text-white" : "text-purple-900"}`}>{label}</Text>
				</Pressable>
			))}
		</View>
	)

	if (!required) return content
	return (
		<Modal transparent animationType="fade" visible onRequestClose={() => {}}>
			<View className="flex-1 justify-center bg-black/50">{content}</View>
		</Modal>
	)
}
