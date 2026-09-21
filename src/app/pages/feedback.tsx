import { Header } from "@/components/Header"
import * as Linking from "expo-linking"
import { Lightbulb, MessageCircle } from "lucide-react-native"
import { useRef, useState } from "react"
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const FEEDBACK_PHONE = "559185184040"
const FEEDBACK_PHONE_LABEL = "+55 91 8518-4040"

export default function FeedbackScreen() {
	const [subject, setSubject] = useState("")
	const [message, setMessage] = useState("")
	const [opening, setOpening] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const openingRef = useRef(false)
	const insets = useSafeAreaInsets()

	async function openWhatsApp() {
		if (openingRef.current) return
		if (!message.trim()) {
			setError("Escreva sua sugestão antes de continuar.")
			return
		}

		openingRef.current = true
		setOpening(true)
		setError(null)
		try {
			const feedbackText = `Feedback Connetti Açaí - ${subject.trim() || "Sugestão de melhoria"}\n\n${message.trim()}`
			await Linking.openURL(
				`https://wa.me/${FEEDBACK_PHONE}?text=${encodeURIComponent(feedbackText)}`,
			)
		} catch {
			setError("Não foi possível abrir o WhatsApp. Tente novamente ou copie sua mensagem e envie pelo WhatsApp para o número abaixo.")
		} finally {
			openingRef.current = false
			setOpening(false)
		}
	}

	return (
		<View className="flex-1 bg-gray-50">
			<Header title="Feedback e sugestões" subtitle="Sua opinião ajuda a melhorar" showBack />
			<KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
				<ScrollView
					contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 24 }}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<View className="rounded-2xl bg-purple-900 p-5">
						<Lightbulb size={28} color="#FFFFFF" />
						<Text className="mt-3 text-xl font-bold text-white">Como podemos melhorar?</Text>
						<Text className="mt-2 leading-5 text-purple-200">
							Compartilhe suas ideias e sugestões de melhorias para o Connetti Açaí.
						</Text>
					</View>

					<View className="mt-5 rounded-2xl bg-white p-4">
						<Text className="mb-2 font-semibold text-gray-900">Assunto (opcional)</Text>
						<TextInput
							accessibilityLabel="Assunto (opcional)"
							value={subject}
							onChangeText={setSubject}
							maxLength={120}
							placeholder="Ex.: melhoria na busca de ofertas"
							placeholderTextColor="#6B7280"
							className="rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900"
						/>
						<Text className="mb-2 mt-5 font-semibold text-gray-900">Sua sugestão</Text>
						<TextInput
							accessibilityLabel="Sua sugestão, obrigatória"
							value={message}
							onChangeText={setMessage}
							multiline
							maxLength={2000}
							textAlignVertical="top"
							placeholder="Conte o que você gostaria de melhorar e como isso ajudaria no seu dia a dia."
							placeholderTextColor="#6B7280"
							className="min-h-48 rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900"
						/>
						<Text className="mt-2 text-right text-xs text-gray-500">{message.length}/2000</Text>
						{error ? <Text accessibilityLiveRegion="polite" className="mt-3 text-red-600">{error}</Text> : null}
						<Text className="mt-4 text-sm text-gray-500">Enviar para:</Text>
						<Text selectable className="mt-1 text-purple-900">{FEEDBACK_PHONE_LABEL}</Text>
						<Text className="mt-3 text-sm leading-5 text-gray-600">
							O WhatsApp será aberto com a mensagem preenchida. Conclua o envio por lá.
						</Text>
						<Pressable
							onPress={openWhatsApp}
							disabled={opening}
							accessibilityRole="button"
							accessibilityState={{ disabled: opening, busy: opening }}
							className={`mt-5 flex-row items-center justify-center gap-2 rounded-xl bg-purple-900 px-4 py-4 ${opening ? "opacity-60" : ""}`}
						>
							<MessageCircle size={20} color="#FFFFFF" />
							<Text className="font-bold text-white">{opening ? "Abrindo WhatsApp..." : "Enviar pelo WhatsApp"}</Text>
						</Pressable>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	)
}
