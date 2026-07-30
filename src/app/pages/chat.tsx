import { useEffect, useRef, useState } from "react"
import {
	FlatList,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

type ChatMessage = {
	type: string
	from: string
	text: string
	createdAt: string
}

const USER_NAME = "App"
// const WS_URL = "ws://192.168.1.50:3333/chat"
const WS_URL = "wss://fastify-auth-api.onrender.com/chat"

export default function ChatScreen() {
	const insets = useSafeAreaInsets()

	const socketRef = useRef<WebSocket | null>(null)
	const flatListRef = useRef<FlatList<ChatMessage>>(null)

	const [connected, setConnected] = useState(false)
	const [message, setMessage] = useState("")
	const [messages, setMessages] = useState<ChatMessage[]>([])

	const [keyboardKey, setKeyboardKey] = useState(0)

	useEffect(() => {
		const hideSub = Keyboard.addListener(
			Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
			() => {
				setKeyboardKey((prev) => prev + 1)
			},
		)

		return () => {
			hideSub.remove()
		}
	}, [])

	useEffect(() => {
		const socket = new WebSocket(WS_URL)

		socketRef.current = socket

		socket.onopen = () => setConnected(true)

		socket.onmessage = (event) => {
			const data = JSON.parse(event.data)

			if (data.type === "message") {
				setMessages((prev) => [...prev, data])
			}
		}

		socket.onerror = (error) => {
			console.log("Erro WebSocket:", error)
		}

		socket.onclose = () => setConnected(false)

		return () => socket.close()
	}, [])

	useEffect(() => {
		const timeout = setTimeout(() => {
			flatListRef.current?.scrollToEnd({ animated: true })
		}, 100)

		return () => clearTimeout(timeout)
	}, [messages.length])

	function sendMessage() {
		const text = message.trim()

		if (!text) return
		if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
			return
		}

		socketRef.current.send(
			JSON.stringify({
				from: USER_NAME,
				text,
			}),
		)

		setMessage("")
	}

	return (
		<SafeAreaView edges={["top"]} className="flex-1 bg-slate-900">
			<KeyboardAvoidingView
				key={keyboardKey}
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
			>
				<View className="bg-blue-600 px-5 py-4 rounded-b-3xl">
					<Text className="text-white text-xl font-bold">Chat em Tempo Real</Text>

					<View className="flex-row items-center mt-2">
						<View
							className={`w-2.5 h-2.5 rounded-full mr-2 ${
								connected ? "bg-green-400" : "bg-red-400"
							}`}
						/>

						<Text className="text-blue-100 text-sm">
							{connected ? "Online" : "Offline"}
						</Text>
					</View>
				</View>

				<FlatList
					ref={flatListRef}
					data={messages}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{
						padding: 16,
						paddingBottom: 24,
					}}
					keyExtractor={(_, index) => String(index)}
					renderItem={({ item }) => {
						const mine = item.from === USER_NAME

						return (
							<View
								className={`mb-3 max-w-[80%] px-4 py-3 rounded-2xl ${
									mine
										? "self-end bg-blue-600 rounded-br-md"
										: "self-start bg-white rounded-bl-md"
								}`}
							>
								<Text
									className={`text-xs font-bold mb-1 ${
										mine ? "text-blue-100" : "text-slate-500"
									}`}
								>
									{item.from}
								</Text>

								<Text
									className={`text-base ${
										mine ? "text-white" : "text-slate-900"
									}`}
								>
									{item.text}
								</Text>
							</View>
						)
					}}
				/>

				<View
					className="bg-white px-4 pt-3"
					style={{
						paddingBottom: Math.max(insets.bottom, 12),
					}}
				>
					<View className="flex-row items-center gap-3">
						<TextInput
							value={message}
							onChangeText={setMessage}
							placeholder="Digite uma mensagem..."
							placeholderTextColor="#94a3b8"
							className="flex-1 bg-slate-100 rounded-full px-5 py-4 text-slate-900"
							returnKeyType="send"
							blurOnSubmit={false}
							onSubmitEditing={sendMessage}
						/>

						<Pressable
							onPress={sendMessage}
							className="bg-blue-600 px-5 py-4 rounded-full"
						>
							<Text className="text-white font-bold">Enviar</Text>
						</Pressable>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}
