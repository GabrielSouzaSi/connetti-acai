import { Button } from "@/components/Button"
import { Field } from "@/components/input"
import { API_URL } from "@/config/env"
import axios from "axios"
import { router } from "expo-router"
import { ArrowLeft, CheckCircle2, KeyRound, Smartphone } from "lucide-react-native"
import { useState } from "react"
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StatusBar,
	Text,
	View,
} from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"

type Step = "identifier" | "code" | "password" | "success"

type VerifyResponse = {
	reset_token?: string
	data?: { reset_token?: string }
}

type ApiError = {
	message?: string
	errors?: Record<string, string[]>
}

const recoveryApi = axios.create({
	baseURL: API_URL,
	timeout: 30000,
	headers: { Accept: "application/json", "Content-Type": "application/json" },
})

function formatPhone(value: string) {
	return value
		.replace(/\D/g, "")
		.slice(0, 11)
		.replace(/^(\d{2})(\d)/, "($1) $2")
		.replace(/(\d{5})(\d{1,4})$/, "$1-$2")
}

function getErrorMessage(error: unknown, fallback: string) {
	if (!axios.isAxiosError<ApiError>(error)) return fallback
	const data = error.response?.data
	const validationMessage = data?.errors && Object.values(data.errors).flat()[0]
	return validationMessage || data?.message || fallback
}

const content = {
	identifier: [
		"Recuperar senha",
		"Informe seu telefone cadastrado para receber o código de confirmação.",
	],
	code: ["Confirme o código", "Digite o código de 6 números que enviamos para você."],
	password: [
		"Crie uma nova senha",
		"Escolha uma senha segura e confirme para concluir a recuperação.",
	],
} as const

export default function ForgotPassword() {
	const [step, setStep] = useState<Step>("identifier")
	const [phone, setPhone] = useState("")
	const [code, setCode] = useState("")
	const [resetToken, setResetToken] = useState("")
	const [password, setPassword] = useState("")
	const [confirmation, setConfirmation] = useState("")
	const [error, setError] = useState("")
	const [isLoading, setIsLoading] = useState(false)

	async function sendCode() {
		const digits = phone.replace(/\D/g, "")
		if (digits.length < 10) return setError("Informe um telefone com DDD.")

		setIsLoading(true)
		setError("")
		try {
			await recoveryApi.post("/password-recovery", { phone: `55${digits}` })
			setStep("code")
		} catch (requestError) {
			setError(
				getErrorMessage(requestError, "Não foi possível enviar o código. Tente novamente."),
			)
		} finally {
			setIsLoading(false)
		}
	}

	async function confirmCode() {
		if (!/^\d{6}$/.test(code)) return setError("Digite o código de 6 números.")

		setIsLoading(true)
		setError("")
		try {
			const response = await recoveryApi.post<VerifyResponse>("/password-recovery/verify", {
				phone: `55${phone.replace(/\D/g, "")}`,
				code,
			})
			const token = response.data.reset_token ?? response.data.data?.reset_token
			if (!token) throw new Error("Token de redefinição não retornado pela API.")
			setResetToken(token)
			setStep("password")
		} catch (requestError) {
			setError(getErrorMessage(requestError, "Código inválido ou expirado."))
		} finally {
			setIsLoading(false)
		}
	}

	async function updatePassword() {
		if (password.length < 8) return setError("A senha deve ter pelo menos 8 caracteres.")
		if (password !== confirmation) return setError("As senhas não coincidem.")
		if (!resetToken) return setError("Confirme novamente o código recebido.")

		setIsLoading(true)
		setError("")
		try {
			await recoveryApi.post("/password-recovery/reset", {
				phone: `55${phone.replace(/\D/g, "")}`,
				reset_token: resetToken,
				password,
				password_confirmation: confirmation,
			})
			setStep("success")
		} catch (requestError) {
			setError(getErrorMessage(requestError, "Não foi possível atualizar a senha."))
		} finally {
			setIsLoading(false)
		}
	}

	function goBack() {
		setError("")
		if (step === "password") return setStep("code")
		if (step === "code") {
			setCode("")
			return setStep("identifier")
		}
		router.back()
	}

	const details = step === "success" ? null : content[step]
	const change = (setter: (value: string) => void) => (value: string) => {
		setter(value)
		if (error) setError("")
	}

	return (
		<SafeAreaProvider>
			<StatusBar barStyle="light-content" backgroundColor="#602273" />
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<ScrollView
					showsHorizontalScrollIndicator={false}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ flexGrow: 1 }}
					keyboardShouldPersistTaps="handled"
				>
					<View className="flex-1 bg-white">
						<StatusBar
							barStyle="light-content"
							backgroundColor="transparent"
							translucent
						/>

						<View className="bg-primaryLight">
							<SafeAreaView edges={["top"]} />
						</View>
						<View className="flex-1 px-8 pb-8">
							{step !== "success" && (
								<Pressable
									onPress={goBack}
									className="mt-4 h-11 w-11 items-center justify-center rounded-full bg-white"
									accessibilityRole="button"
									accessibilityLabel="Voltar"
								>
									<ArrowLeft size={24} color="#602273" />
								</Pressable>
							)}

							<View className="flex-1 justify-center">
								{step === "success" ? (
									<View className="items-center">
										<View className="mb-8 h-24 w-24 items-center justify-center rounded-full bg-primaryLight">
											<CheckCircle2 size={52} color="#602273" />
										</View>
										<Text className="text-center text-3xl font-bold text-primary">
											Senha atualizada!
										</Text>
										<Text className="mb-8 mt-3 text-center text-base leading-6 text-gray-600">
											Sua nova senha foi criada. Agora você já pode entrar na
											sua conta.
										</Text>
										<ActionButton
											title="Ir para o login"
											onPress={() => router.replace("/")}
										/>
									</View>
								) : (
									<>
										<View className="mb-8 h-20 w-20 items-center justify-center rounded-full bg-primaryLight">
											{step === "identifier" ? (
												<Smartphone size={38} color="#602273" />
											) : (
												<KeyRound size={38} color="#602273" />
											)}
										</View>
										<Text className="text-3xl font-bold text-primary">
											{details[0]}
										</Text>
										<Text className="mb-8 mt-3 text-base leading-6 text-gray-600">
											{details[1]}
										</Text>

										{step === "identifier" && (
											<>
												<Label>Telefone</Label>
												<View className="flex-row items-center gap-2">
													<View className="h-14 items-center justify-center rounded-xl border-2 border-gray-400 bg-white px-4">
														<Text className="text-base text-gray-700">
															+55
														</Text>
													</View>
													<View className="flex-1">
														<Field
															value={phone}
															onChangeText={(value) =>
																change(setPhone)(formatPhone(value))
															}
															placeholder=""
															keyboardType="phone-pad"
															textContentType="telephoneNumber"
															autoComplete="tel"
															returnKeyType="send"
															onSubmitEditing={sendCode}
															errorMessage={error}
															className="h-14 rounded-xl"
														/>
													</View>
												</View>
												<ActionButton
													title="Enviar código"
													onPress={sendCode}
													loading={isLoading}
												/>
											</>
										)}

										{step === "code" && (
											<>
												<Label>Código de confirmação</Label>
												<Field
													value={code}
													onChangeText={(value) =>
														change(setCode)(
															value.replace(/\D/g, "").slice(0, 6),
														)
													}
													placeholder="000000"
													keyboardType="number-pad"
													textContentType="oneTimeCode"
													maxLength={6}
													errorMessage={error}
													className="h-14 rounded-xl text-center text-2xl tracking-[8px]"
												/>
												<ActionButton
													title="Confirmar código"
													onPress={confirmCode}
													loading={isLoading}
												/>
												<Pressable
													onPress={sendCode}
													disabled={isLoading}
													className="mt-5 items-center py-2"
												>
													<Text className="font-semibold text-primary">
														Reenviar código
													</Text>
												</Pressable>
											</>
										)}

										{step === "password" && (
											<>
												<Label>Nova senha</Label>
												<Field
													value={password}
													onChangeText={change(setPassword)}
													placeholder="Mínimo de 8 caracteres"
													secureTextEntry
													textContentType="newPassword"
													className="h-14 rounded-xl"
												/>
												<Text className="mb-2 mt-5 font-semibold text-gray-700">
													Confirmar nova senha
												</Text>
												<Field
													value={confirmation}
													onChangeText={change(setConfirmation)}
													placeholder="Repita a nova senha"
													secureTextEntry
													textContentType="newPassword"
													errorMessage={error}
													className="h-14 rounded-xl"
												/>
												<ActionButton
													title="Atualizar senha"
													onPress={updatePassword}
													loading={isLoading}
												/>
											</>
										)}
									</>
								)}
							</View>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaProvider>
	)
}

function Label({ children }: { children: string }) {
	return <Text className="mb-2 font-semibold text-gray-700">{children}</Text>
}

function ActionButton({
	title,
	onPress,
	loading = false,
}: {
	title: string
	onPress: () => void
	loading?: boolean
}) {
	return (
		<Button
			disabled={loading}
			onPress={onPress}
			className="mt-6 items-center rounded-3xl bg-secondary py-4"
		>
			{loading ? (
				<ActivityIndicator color="white" />
			) : (
				<Button.TextButton title={title} className="text-xl font-semibold text-white" />
			)}
		</Button>
	)
}
