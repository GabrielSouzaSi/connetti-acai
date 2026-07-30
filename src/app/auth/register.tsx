import { Button } from "@/components/Button"
import { Field } from "@/components/input"
import axios from "axios"
import { router } from "expo-router"
import { ArrowRight, MapIcon, MapPin, Mars, UserRoundSearch, Venus } from "lucide-react-native"
import { useState } from "react"
import { ActivityIndicator, Alert, Image, Keyboard, ScrollView, Text, View } from "react-native"

type Gender = "masculino" | "feminino" | "outro" | "prefiro_nao_informar"
type ProfileType = "produtor" | "comprador"

type ApiError = {
	message?: string
	error?: string
	errors?: Array<{ message?: string }> | Record<string, string[]>
	issues?: Array<{ message?: string }>
}

// Instância isolada: não herda o Authorization global configurado no AuthContext.
const authApi = axios.create({
	baseURL: "https://fastify-auth-api.onrender.com",
	timeout: 180000,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
})

authApi.interceptors.request.use((config) => {
	config.headers.delete("Authorization")
	return config
})

const MOCK_LOCATION = {
	municipality_id: 1,
	community: "Comunidade Rio Verde",
	latitude: -1.7218,
	longitude: -48.8788,
	id_device: "device-token-ou-identificador",
}

export default function Register() {
	const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [phone, setPhone] = useState("")
	const [gender, setGender] = useState<Gender | null>(null)
	const [profileType, setProfileType] = useState<ProfileType | null>(null)
	const [password, setPassword] = useState("")
	const [passwordConfirmation, setPasswordConfirmation] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)

	function optionClassName(selected: boolean) {
		return `flex-1 items-center justify-center border p-3 rounded-xl ${
			selected ? "border-primary bg-primaryLight" : "border-gray-300"
		}`
	}

	async function handleRegister() {
		const normalizedName = name.trim()
		const normalizedEmail = email.trim().toLowerCase()
		const normalizedPhone = phone.replace(/\D/g, "")

		if (
			!normalizedName ||
			!normalizedEmail ||
			!normalizedPhone ||
			!gender ||
			!profileType ||
			!password ||
			!passwordConfirmation
		) {
			Alert.alert("Atenção", "Preencha todos os campos para continuar.")
			return
		}

		if (password.length < 8) {
			Alert.alert("Senha inválida", "A senha deve ter pelo menos 8 caracteres.")
			return
		}

		if (password !== passwordConfirmation) {
			Alert.alert("Senhas diferentes", "As senhas não coincidem.")
			return
		}

		setIsSubmitting(true)
		Keyboard.dismiss()

		try {
			const payload = {
				name: normalizedName,
				email: normalizedEmail,
				phone: normalizedPhone,
				gender,
				profile_type: profileType,
				municipality_id: MOCK_LOCATION.municipality_id,
				community: MOCK_LOCATION.community,
				latitude: MOCK_LOCATION.latitude,
				longitude: MOCK_LOCATION.longitude,
				id_device: MOCK_LOCATION.id_device,
				password,
				password_confirmation: passwordConfirmation,
			}

			await authApi.post("/register", payload)

			Alert.alert("Cadastro realizado", "Sua conta foi criada com sucesso.", [
				{ text: "Entrar", onPress: () => router.replace("/") },
			])
		} catch (error) {
			if (!axios.isAxiosError<ApiError>(error)) {
				console.error("Erro inesperado no cadastro:", error)
				Alert.alert("Erro no cadastro", "Ocorreu um erro inesperado. Tente novamente.")
				return
			}

			const responseData = error.response?.data
			const validationMessage = Array.isArray(responseData?.errors)
				? responseData.errors[0]?.message
				: responseData?.errors
					? Object.values(responseData.errors).flat()[0]
					: responseData?.issues?.[0]?.message

			console.error("Falha no cadastro:", {
				status: error.response?.status,
				code: error.code,
				message: error.message,
				data: responseData,
			})

			const message = !error.response
				? "Não foi possível conectar à API. Verifique sua internet e tente novamente."
				: responseData?.message ||
					validationMessage ||
					responseData?.error ||
					`A API recusou o cadastro (HTTP ${error.response.status}).`

			Alert.alert("Erro no cadastro", message)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			keyboardShouldPersistTaps="handled"
			contentContainerStyle={{ paddingBottom: 16 }}
			className="flex-1 bg-white"
		>
			<View className="flex-1 p-4 gap-3 bg-white">
				<View className="items-center">
					<Image
						className="w-48 h-20"
						source={require("@/assets/logo.png")}
						resizeMode="contain"
					/>
				</View>

				<Text className="text-2xl font-bold text-primary">Cadastro rápido</Text>
				<Text className="text-base font-medium">Crie sua conta em poucos passos</Text>

				<Field
					className="border border-gray-300 rounded-xl"
					placeholder="Nome completo"
					value={name}
					onChangeText={setName}
					autoCapitalize="words"
				/>
				<Field
					className="border border-gray-300 rounded-xl"
					placeholder="E-mail"
					value={email}
					onChangeText={setEmail}
					keyboardType="email-address"
					autoComplete="email"
				/>
				<Field
					className="border border-gray-300 rounded-xl"
					placeholder="Telefone / WhatsApp"
					value={phone}
					onChangeText={setPhone}
					keyboardType="phone-pad"
					autoComplete="tel"
				/>

				<Text className="text-lg font-bold">Gênero</Text>
				<View className="flex-row gap-2">
					<Button
						onPress={() => setGender("masculino")}
						className={`${optionClassName(gender === "masculino")} flex-row gap-2`}
					>
						<Button.Icon Icon={Mars} size={20} />
						<Button.TextButton className="text-base font-medium" title="Masculino" />
					</Button>
					<Button
						onPress={() => setGender("feminino")}
						className={`${optionClassName(gender === "feminino")} flex-row gap-2`}
					>
						<Button.Icon Icon={Venus} size={20} />
						<Button.TextButton className="text-base font-medium" title="Feminino" />
					</Button>
					<Button
						onPress={() => setGender("outro")}
						className={`${optionClassName(gender === "outro")} flex-row gap-2`}
					>
						<Button.Icon Icon={UserRoundSearch} size={20} />
						<Button.TextButton className="text-base font-medium" title="Outro" />
					</Button>
				</View>
				<Button
					onPress={() => setGender("prefiro_nao_informar")}
					className={optionClassName(gender === "prefiro_nao_informar")}
				>
					<Button.TextButton
						className="text-base font-medium"
						title="Prefiro não informar"
					/>
				</Button>

				<Text className="text-lg font-bold">Tipo de perfil</Text>
				<View className="flex-row gap-2">
					<Button
						onPress={() => setProfileType("produtor")}
						className={optionClassName(profileType === "produtor")}
					>
						<Button.TextButton className="text-base font-medium" title="Produtor" />
					</Button>
					<Button
						onPress={() => setProfileType("comprador")}
						className={optionClassName(profileType === "comprador")}
					>
						<Button.TextButton className="text-base font-medium" title="Comprador" />
					</Button>
				</View>

				<Field
					className="border border-gray-300 rounded-xl"
					placeholder="Senha (mínimo de 8 caracteres)"
					value={password}
					onChangeText={setPassword}
					secureTextEntry
					autoComplete="new-password"
				/>
				<Field
					className="border border-gray-300 rounded-xl"
					placeholder="Confirme sua senha"
					value={passwordConfirmation}
					onChangeText={setPasswordConfirmation}
					secureTextEntry
					autoComplete="new-password"
				/>

				<View className="flex-row items-center border border-gray-300 p-3 rounded-xl gap-4">
					<MapPin size={20} />
					<Text className="text-base font-medium">
						Município: {MOCK_LOCATION.municipality_id}
					</Text>
				</View>
				<View className="flex-row items-center border border-gray-300 p-3 rounded-xl gap-4">
					<MapIcon size={20} />
					<Text className="text-base font-medium">{MOCK_LOCATION.community}</Text>
				</View>

				<Button
					onPress={handleRegister}
					disabled={isSubmitting}
					className="flex-row bg-secondary items-center p-3 rounded-xl mt-4"
				>
					<Button.ViewButton className="flex-1 items-center">
						{isSubmitting ? (
							<ActivityIndicator color="white" />
						) : (
							<Button.TextButton
								className="font-semibold text-2xl text-white"
								title="Cadastrar"
							/>
						)}
					</Button.ViewButton>
					{!isSubmitting && <Button.Icon Icon={ArrowRight} size={20} color="white" />}
				</Button>
			</View>
		</ScrollView>
	)
}
