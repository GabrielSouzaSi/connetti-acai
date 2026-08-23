import { Header } from "@/components/Header"
import { router } from "expo-router"
import { ChevronRight, HelpCircle, MessageCircle } from "lucide-react-native"
import { useState } from "react"
import { Pressable, ScrollView, Text, View } from "react-native"

const questions = [
	{
		question: "Como criar uma oferta?",
		answer: "Acesse a aba Ofertas, toque no botão de adicionar e preencha os dados solicitados.",
	},
	{
		question: "Como acompanhar uma negociação?",
		answer: "Abra a aba Negociações para consultar propostas, mensagens e o andamento de cada conversa.",
	},
	{
		question: "Como alterar meus dados?",
		answer: "Por segurança, solicite a alteração dos seus dados cadastrais pelo chat com suporte.",
	},
]

export default function HelpSupportScreen() {
	const [openQuestion, setOpenQuestion] = useState<number | null>(null)

	return (
		<View className="flex-1 bg-gray-50">
			<Header title="Ajuda e suporte" subtitle="Como podemos ajudar?" showBack />
			<ScrollView contentContainerClassName="p-5 pb-10" showsVerticalScrollIndicator={false}>
				<View className="rounded-2xl bg-purple-900 p-5">
					<View className="h-12 w-12 items-center justify-center rounded-full bg-white/20">
						<MessageCircle size={25} color="#FFFFFF" />
					</View>
					<Text className="mt-4 text-xl font-bold text-white">Fale com nossa equipe</Text>
					<Text className="mt-1 leading-5 text-purple-200">
						Envie sua dúvida e acompanhe o atendimento pelo chat.
					</Text>
					<Pressable
						onPress={() => router.push("/pages/chat")}
						className="mt-4 flex-row items-center justify-center rounded-xl bg-white px-4 py-3"
					>
						<Text className="font-bold text-purple-900">Abrir chat com suporte</Text>
						<ChevronRight className="ml-1" size={20} color="#512B76" />
					</Pressable>
				</View>

				<Text className="mb-3 mt-6 text-lg font-bold text-gray-900">
					Perguntas frequentes
				</Text>
				<View className="overflow-hidden rounded-2xl bg-white">
					{questions.map(({ question, answer }, index) => {
						const open = openQuestion === index
						return (
							<Pressable
								key={question}
								onPress={() => setOpenQuestion(open ? null : index)}
								className={`p-4 ${index < questions.length - 1 ? "border-b border-gray-100" : ""}`}
							>
								<View className="flex-row items-center">
									<HelpCircle size={20} color="#512B76" />
									<Text className="ml-3 flex-1 font-semibold text-gray-900">
										{question}
									</Text>
									<ChevronRight
										size={20}
										color="#9CA3AF"
										style={{ transform: [{ rotate: open ? "90deg" : "0deg" }] }}
									/>
								</View>
								{open ? (
									<Text className="ml-8 mt-3 leading-5 text-gray-600">
										{answer}
									</Text>
								) : null}
							</Pressable>
						)
					})}
				</View>
			</ScrollView>
		</View>
	)
}
