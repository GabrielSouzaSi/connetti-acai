import { Button } from "@/components/Button"
import { Field } from "@/components/input"
import axios from "axios"
import { router } from "expo-router"
import {
	ArrowRight,
	Check,
	ChevronDown,
	MapIcon,
	MapPin,
	Mars,
	Search,
	UserRoundSearch,
	Venus,
	X,
} from "lucide-react-native"
import { useEffect, useMemo, useState } from "react"
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Image,
	Keyboard,
	Modal,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native"

type Gender = "masculino" | "feminino" | "outro" | "prefiro_nao_informar"
type ProfileType = "produtor" | "comprador"

type ApiError = {
	message?: string
	error?: string
	errors?: Array<{ message?: string }> | Record<string, string[]>
	issues?: Array<{ message?: string }>
}

type Municipality = {
	id: number
	name: string
	state: string
	latitude: number | null
	longitude: number | null
}

type MunicipalitiesResponse = {
	message: string
	data: Municipality[]
}

type Locality = {
	id: number
	municipality_id: number
	name: string
	address: string | null
	latitude: number | null
	longitude: number | null
	municipality: Municipality
}

type LocalitiesResponse = {
	message: string
	data: Locality[]
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
	const [municipalities, setMunicipalities] = useState<Municipality[]>([])
	const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | null>(null)
	const [isMunicipalityModalVisible, setIsMunicipalityModalVisible] = useState(false)
	const [isLoadingMunicipalities, setIsLoadingMunicipalities] = useState(false)
	const [municipalitiesError, setMunicipalitiesError] = useState("")
	const [municipalitySearch, setMunicipalitySearch] = useState("")
	const [localities, setLocalities] = useState<Locality[]>([])
	const [selectedLocality, setSelectedLocality] = useState<Locality | null>(null)
	const [isLocalityModalVisible, setIsLocalityModalVisible] = useState(false)
	const [isLoadingLocalities, setIsLoadingLocalities] = useState(false)
	const [localitiesError, setLocalitiesError] = useState("")
	const [localitySearch, setLocalitySearch] = useState("")

	const filteredMunicipalities = useMemo(() => {
		const search = municipalitySearch.trim().toLocaleLowerCase("pt-BR")
		if (!search) return municipalities

		return municipalities.filter((municipality) =>
			`${municipality.name} ${municipality.state}`
				.toLocaleLowerCase("pt-BR")
				.includes(search),
		)
	}, [municipalities, municipalitySearch])

	const filteredLocalities = useMemo(() => {
		if (!selectedMunicipality) return []

		const search = localitySearch.trim().toLocaleLowerCase("pt-BR")
		return localities.filter((locality) => {
			const belongsToMunicipality = locality.municipality_id === selectedMunicipality.id
			const matchesSearch =
				!search || locality.name.toLocaleLowerCase("pt-BR").includes(search)
			return belongsToMunicipality && matchesSearch
		})
	}, [localities, localitySearch, selectedMunicipality])

	async function loadMunicipalities() {
		setIsLoadingMunicipalities(true)
		setMunicipalitiesError("")

		try {
			const { data } = await authApi.get<MunicipalitiesResponse>("/municipalities")
			setMunicipalities(data.data)
		} catch (error) {
			console.error("Falha ao carregar municípios:", error)
			setMunicipalitiesError("Não foi possível carregar os municípios.")
		} finally {
			setIsLoadingMunicipalities(false)
		}
	}

	async function loadLocalities() {
		setIsLoadingLocalities(true)
		setLocalitiesError("")

		try {
			const { data } = await authApi.get<LocalitiesResponse>("/localities")
			setLocalities(data.data)
		} catch (error) {
			console.error("Falha ao carregar comunidades:", error)
			setLocalitiesError("Não foi possível carregar as comunidades.")
		} finally {
			setIsLoadingLocalities(false)
		}
	}

	useEffect(() => {
		void loadMunicipalities()
		void loadLocalities()
	}, [])

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
			!selectedMunicipality ||
			!selectedLocality ||
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
				municipality_id: selectedMunicipality.id,
				community: selectedLocality.name,
				latitude: MOCK_LOCATION.latitude,
				longitude: MOCK_LOCATION.longitude,
				id_device: MOCK_LOCATION.id_device,
				password,
				password_confirmation: passwordConfirmation,
			}
			console.log("Dados: " + JSON.stringify(payload))

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

				<Text className="text-lg font-bold">Localização</Text>
				<Pressable
					onPress={() => setIsMunicipalityModalVisible(true)}
					disabled={isLoadingMunicipalities}
					className="flex-row items-center border border-gray-300 p-3 rounded-xl gap-4"
				>
					<MapPin size={20} />
					<Text
						className={`flex-1 text-base font-medium ${
							selectedMunicipality ? "text-gray-900" : "text-gray-500"
						}`}
					>
						{isLoadingMunicipalities
							? "Carregando municípios..."
							: selectedMunicipality
								? `${selectedMunicipality.name} - ${selectedMunicipality.state}`
								: "Selecione o município"}
					</Text>
					{isLoadingMunicipalities ? (
						<ActivityIndicator size="small" color="#512B76" />
					) : (
						<ChevronDown size={20} />
					)}
				</Pressable>
				{municipalitiesError && (
					<View className="flex-row items-center justify-between">
						<Text className="flex-1 text-sm text-red-500">{municipalitiesError}</Text>
						<Pressable onPress={loadMunicipalities} className="px-3 py-2">
							<Text className="font-semibold text-primary">Tentar novamente</Text>
						</Pressable>
					</View>
				)}
				<Pressable
					onPress={() => setIsLocalityModalVisible(true)}
					disabled={!selectedMunicipality || isLoadingLocalities}
					className={`flex-row items-center border border-gray-300 p-3 rounded-xl gap-4 ${
						!selectedMunicipality ? "opacity-50" : ""
					}`}
				>
					<MapIcon size={20} />
					<Text
						className={`flex-1 text-base font-medium ${
							selectedLocality ? "text-gray-900" : "text-gray-500"
						}`}
					>
						{!selectedMunicipality
							? "Selecione primeiro o município"
							: isLoadingLocalities
								? "Carregando comunidades..."
								: selectedLocality?.name || "Selecione a comunidade"}
					</Text>
					{isLoadingLocalities ? (
						<ActivityIndicator size="small" color="#512B76" />
					) : (
						<ChevronDown size={20} />
					)}
				</Pressable>
				{localitiesError && (
					<View className="flex-row items-center justify-between">
						<Text className="flex-1 text-sm text-red-500">{localitiesError}</Text>
						<Pressable onPress={loadLocalities} className="px-3 py-2">
							<Text className="font-semibold text-primary">Tentar novamente</Text>
						</Pressable>
					</View>
				)}

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

			<Modal
				visible={isMunicipalityModalVisible}
				transparent
				animationType="slide"
				onRequestClose={() => setIsMunicipalityModalVisible(false)}
			>
				<View className="flex-1 justify-end bg-black/40">
					<View className="max-h-[80%] rounded-t-3xl bg-white px-4 pb-6 pt-4">
						<View className="mb-4 flex-row items-center justify-between">
							<View>
								<Text className="text-xl font-bold text-gray-900">
									Selecione o município
								</Text>
								<Text className="text-sm text-gray-500">
									Escolha uma das opções disponíveis
								</Text>
							</View>
							<Pressable
								onPress={() => setIsMunicipalityModalVisible(false)}
								className="rounded-full bg-gray-100 p-2"
							>
								<X size={22} color="#374151" />
							</Pressable>
						</View>

						<View className="mb-3 flex-row items-center gap-3 rounded-xl border border-gray-300 px-3">
							<Search size={20} color="#6B7280" />
							<Field
								className="flex-1 border-0 px-0"
								placeholder="Buscar município"
								value={municipalitySearch}
								onChangeText={setMunicipalitySearch}
								autoCapitalize="words"
							/>
						</View>

						<FlatList
							data={filteredMunicipalities}
							keyExtractor={(item) => String(item.id)}
							keyboardShouldPersistTaps="handled"
							showsVerticalScrollIndicator={false}
							ListEmptyComponent={
								<Text className="py-8 text-center text-gray-500">
									Nenhum município encontrado.
								</Text>
							}
							renderItem={({ item }) => {
								const isSelected = selectedMunicipality?.id === item.id

								return (
									<Pressable
										onPress={() => {
											if (selectedMunicipality?.id !== item.id) {
												setSelectedLocality(null)
											}
											setSelectedMunicipality(item)
											setMunicipalitySearch("")
											setIsMunicipalityModalVisible(false)
										}}
										className={`mb-2 flex-row items-center rounded-xl border p-4 ${
											isSelected
												? "border-primary bg-primaryLight"
												: "border-gray-200 bg-white"
										}`}
									>
										<MapPin size={20} color="#512B76" />
										<View className="ml-3 flex-1">
											<Text className="font-semibold text-gray-900">
												{item.name}
											</Text>
											<Text className="text-sm text-gray-500">
												{item.state}
											</Text>
										</View>
										{isSelected && <Check size={20} color="#512B76" />}
									</Pressable>
								)
							}}
						/>
					</View>
				</View>
			</Modal>

			<Modal
				visible={isLocalityModalVisible}
				transparent
				animationType="slide"
				onRequestClose={() => setIsLocalityModalVisible(false)}
			>
				<View className="flex-1 justify-end bg-black/40">
					<View className="max-h-[80%] rounded-t-3xl bg-white px-4 pb-6 pt-4">
						<View className="mb-4 flex-row items-center justify-between">
							<View className="flex-1 pr-4">
								<Text className="text-xl font-bold text-gray-900">
									Selecione a comunidade
								</Text>
								<Text className="text-sm text-gray-500">
									{selectedMunicipality
										? `${selectedMunicipality.name} - ${selectedMunicipality.state}`
										: "Município não selecionado"}
								</Text>
							</View>
							<Pressable
								onPress={() => setIsLocalityModalVisible(false)}
								className="rounded-full bg-gray-100 p-2"
							>
								<X size={22} color="#374151" />
							</Pressable>
						</View>

						<View className="mb-3 flex-row items-center gap-3 rounded-xl border border-gray-300 px-3">
							<Search size={20} color="#6B7280" />
							<Field
								className="flex-1 border-0 px-0"
								placeholder="Buscar comunidade"
								value={localitySearch}
								onChangeText={setLocalitySearch}
								autoCapitalize="words"
							/>
						</View>

						<FlatList
							data={filteredLocalities}
							keyExtractor={(item) => String(item.id)}
							keyboardShouldPersistTaps="handled"
							showsVerticalScrollIndicator={false}
							ListEmptyComponent={
								<Text className="py-8 text-center text-gray-500">
									Nenhuma comunidade encontrada para este município.
								</Text>
							}
							renderItem={({ item }) => {
								const isSelected = selectedLocality?.id === item.id

								return (
									<Pressable
										onPress={() => {
											setSelectedLocality(item)
											setLocalitySearch("")
											setIsLocalityModalVisible(false)
										}}
										className={`mb-2 flex-row items-center rounded-xl border p-4 ${
											isSelected
												? "border-primary bg-primaryLight"
												: "border-gray-200 bg-white"
										}`}
									>
										<MapIcon size={20} color="#512B76" />
										<View className="ml-3 flex-1">
											<Text className="font-semibold text-gray-900">
												{item.name}
											</Text>
											{item.address && (
												<Text className="text-sm text-gray-500">
													{item.address}
												</Text>
											)}
										</View>
										{isSelected && <Check size={20} color="#512B76" />}
									</Pressable>
								)
							}}
						/>
					</View>
				</View>
			</Modal>
		</ScrollView>
	)
}
