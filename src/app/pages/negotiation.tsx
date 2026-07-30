import { router } from "expo-router"
import { ArrowLeft, Check, Mic, MoreVertical, Pencil, Send, X } from "lucide-react-native"
import { useRef, useState } from "react"
import {
	FlatList,
	Image,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type Message = {
	id: number
	text: string
	time: string
	fromMe: boolean
}

const messagesMock: Message[] = [
	{
		id: 1,
		text: "Olá! Tenho interesse na sua oferta de açaí. Ainda disponível?",
		time: "09:15",
		fromMe: false,
	},
	{
		id: 2,
		text: "Olá! Tenho sim, está disponível 900 kg de açaí fresco.",
		time: "09:16",
		fromMe: true,
	},
	{
		id: 3,
		text: "Qual o valor mínimo que você consegue?",
		time: "09:17",
		fromMe: false,
	},
	{
		id: 4,
		text: "Posso fazer por R$ 4,30 / kg para pagamento à vista.",
		time: "09:18",
		fromMe: true,
	},
	{
		id: 5,
		text: "Consigo fechar em R$ 4,20 / kg no PIX. Pode ser?",
		time: "09:20",
		fromMe: false,
	},
]

export default function NegotiationScreen() {
	const flatListRef = useRef<FlatList<Message>>(null)

	const [messages, setMessages] = useState<Message[]>(messagesMock)
	const [message, setMessage] = useState("")
	const [proposalPrice, setProposalPrice] = useState("4.20")

	function sendMessage() {
		if (!message.trim()) return

		const newMessage: Message = {
			id: Date.now(),
			text: message,
			time: new Date().toLocaleTimeString("pt-BR", {
				hour: "2-digit",
				minute: "2-digit",
			}),
			fromMe: true,
		}

		setMessages((old) => [...old, newMessage])
		setMessage("")

		setTimeout(() => {
			flatListRef.current?.scrollToEnd({ animated: true })
		}, 100)
	}

	function renderMessage({ item }: { item: Message }) {
		return (
			<View className={`mb-3 flex-row ${item.fromMe ? "justify-end" : "justify-start"}`}>
				{!item.fromMe && (
					<Image
						source={{
							uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
						}}
						className="w-8 h-8 rounded-full mr-2"
					/>
				)}

				<View
					className={`max-w-[76%] rounded-2xl px-4 py-3 ${
						item.fromMe ? "bg-purple-900 rounded-br-md" : "bg-white rounded-bl-md"
					}`}
				>
					<Text
						className={`text-sm leading-5 ${
							item.fromMe ? "text-white" : "text-gray-800"
						}`}
					>
						{item.text}
					</Text>

					<Text
						className={`text-[10px] mt-1 text-right ${
							item.fromMe ? "text-purple-200" : "text-gray-400"
						}`}
					>
						{item.time}
					</Text>
				</View>
			</View>
		)
	}

	return (
		<SafeAreaView className="flex-1 bg-purple-950">
			<KeyboardAvoidingView
				className="flex-1"
				behavior={Platform.OS === "ios" ? "padding" : undefined}
			>
				{/* Header */}
				<View className="bg-purple-950 px-4 py-3 flex-row items-center">
					<Pressable onPress={() => router.back()} className="mr-3">
						<ArrowLeft size={24} color="#fff" />
					</Pressable>

					<Image
						source={{
							uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
						}}
						className="w-11 h-11 rounded-full mr-3"
					/>

					<View className="flex-1">
						<Text className="text-white font-bold text-base">Raimundo Souza</Text>

						<View className="flex-row items-center gap-1">
							<View className="w-2 h-2 rounded-full bg-green-400" />
							<Text className="text-green-300 text-xs">Online</Text>
						</View>
					</View>

					<Pressable>
						<MoreVertical size={24} color="#fff" />
					</Pressable>
				</View>

				<View className="flex-1 bg-gray-50 rounded-t-3xl overflow-hidden">
					{/* Card da oferta */}
					<View className="bg-white mx-4 mt-4 mb-2 rounded-xl p-3 flex-row items-center shadow-sm border border-gray-100">
						<Image
							source={{
								uri: "https://images.unsplash.com/photo-1603700737604-cbe32db15c48?w=300",
							}}
							className="w-14 h-14 rounded-full mr-3"
						/>

						<View className="flex-1">
							<Text className="text-gray-900 font-bold">
								Açaí - 900 kg - R$ 4,30/kg
							</Text>

							<Text className="text-gray-500 text-xs mt-1">Abel Figueiredo • PA</Text>
						</View>
					</View>

					{/* Lista de mensagens */}
					<FlatList
						ref={flatListRef}
						data={messages}
						keyExtractor={(item) => String(item.id)}
						renderItem={renderMessage}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{
							paddingHorizontal: 16,
							paddingTop: 12,
							paddingBottom: 12,
						}}
						onContentSizeChange={() =>
							flatListRef.current?.scrollToEnd({ animated: true })
						}
					/>

					{/* Proposta */}
					<View className="mx-4 mb-3 bg-purple-50 border border-purple-200 rounded-2xl p-4">
						<View className="flex-row justify-between items-center">
							<View>
								<Text className="text-purple-900 font-semibold text-sm">
									Sua proposta
								</Text>

								<Text className="text-2xl font-bold text-purple-950 mt-1">
									R$ {proposalPrice.replace(".", ",")} / kg
								</Text>

								<Text className="text-gray-500 text-xs mt-1">
									Enviada agora há pouco
								</Text>
							</View>

							<Pressable className="w-9 h-9 rounded-full bg-purple-100 items-center justify-center">
								<Pencil size={18} color="#4C1D95" />
							</Pressable>
						</View>
					</View>

					{/* Botões de ação */}
					<View className="px-4 flex-row gap-2 mb-3">
						<Pressable className="flex-1 bg-green-600 rounded-lg py-3 flex-row items-center justify-center gap-2">
							<Send size={15} color="#fff" />
							<Text className="text-white font-semibold text-xs">
								Enviar proposta
							</Text>
						</Pressable>

						<Pressable className="flex-1 bg-green-700 rounded-lg py-3 flex-row items-center justify-center gap-2">
							<Check size={15} color="#fff" />
							<Text className="text-white font-semibold text-xs">Aceitar</Text>
						</Pressable>

						<Pressable className="flex-1 bg-red-600 rounded-lg py-3 flex-row items-center justify-center gap-2">
							<X size={15} color="#fff" />
							<Text className="text-white font-semibold text-xs">Recusar</Text>
						</Pressable>
					</View>

					{/* Campo de mensagem */}
					<View className="bg-white border-t border-gray-200 px-4 py-3 flex-row items-center gap-2">
						<Pressable className="w-9 h-9 rounded-full border border-purple-200 items-center justify-center">
							<Text className="text-purple-900 font-bold">＋</Text>
						</Pressable>

						<TextInput
							value={message}
							onChangeText={setMessage}
							placeholder="Digite sua mensagem..."
							placeholderTextColor="#9CA3AF"
							className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-gray-900"
						/>

						<Pressable
							onPress={message.trim() ? sendMessage : undefined}
							className="w-11 h-11 bg-purple-900 rounded-full items-center justify-center"
						>
							{message.trim() ? (
								<Send size={19} color="#fff" />
							) : (
								<Mic size={20} color="#fff" />
							)}
						</Pressable>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}
