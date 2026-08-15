import { Ionicons } from "@expo/vector-icons"
import { Text, View } from "react-native"
import colors from "tailwindcss/colors"

export function CustomToast({ text1, text2, type }: any) {
	const sucess = colors.green[500]
	const error = colors.red[500]
	const info = colors.blue[500]
	const backgroundColor = {
		success: `${sucess}`,
		error: `${error}`,
		info: `${info}`,
	}[type]

	const icon = {
		success: "checkmark-circle",
		error: "alert-circle",
		info: "information-circle",
	}[type]

	return (
		<View
			style={{
				width: "90%",
				borderRadius: 12,
				paddingVertical: 14,
				paddingHorizontal: 16,
				backgroundColor,
				alignSelf: "center",
				flexDirection: "row",
				alignItems: "center",
				gap: 12,
				shadowColor: "#000",
				shadowOpacity: 0.2,
				shadowRadius: 4,
				elevation: 5,
			}}
		>
			<Ionicons name={icon as any} size={28} color="#fff" />

			<View style={{ flex: 1 }}>
				{text1 && (
					<Text
						style={{
							color: "#fff",
							fontWeight: "bold",
							fontSize: 16,
						}}
					>
						{text1}
					</Text>
				)}

				{text2 && <Text style={{ color: "#fff", fontSize: 14 }}>{text2}</Text>}
			</View>
		</View>
	)
}
