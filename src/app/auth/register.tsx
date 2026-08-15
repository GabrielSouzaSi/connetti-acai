import { Button } from "@/components/Button"
import { API_URL } from "@/config/env"
import { Field } from "@/components/input"
import axios from "axios"
import * as Location from "expo-location"
import { router } from "expo-router"
import {
	ArrowLeft,
	ArrowRight,
	Check,
	ChevronDown,
	LocateFixed,
	MapIcon,
	MapPin,
	Search,
	X,
} from "lucide-react-native"
import { useEffect, useMemo, useRef, useState } from "react"
import {
	ActivityIndicator,
	FlatList,
	Image,
	Keyboard,
	Modal,
	Pressable,
	ScrollView,
	Text,
	View,
} from "react-native"
import Toast from "react-native-toast-message"

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

type RegistrationOption = {
	id: number
	value?: string
	name?: string
	label: string
	description?: string | null
}

type RegistrationOptionsResponse = {
	message: string
	data: RegistrationOption[]
}

type Property = {
	id: number
	name: string
	address: string | null
	municipality_id: number
	municipality: Municipality
	latitude: number | null
	longitude: number | null
}

type PropertiesResponse = {
	message: string
	data: Property[]
}

type Coordinates = {
	latitude: number
	longitude: number
}

// Instância isolada: não herda o Authorization global configurado no AuthContext.
const authApi = axios.create({
	baseURL: API_URL,
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

export default function Register() {
	const scrollViewRef = useRef<ScrollView>(null)
	const [step, setStep] = useState<1 | 2 | 3>(1)
	const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [phone, setPhone] = useState("")
	const [genders, setGenders] = useState<RegistrationOption[]>([])
	const [selectedGender, setSelectedGender] = useState<RegistrationOption | null>(null)
	const [roles, setRoles] = useState<RegistrationOption[]>([])
	const [selectedRole, setSelectedRole] = useState<RegistrationOption | null>(null)
	const [isLoadingOptions, setIsLoadingOptions] = useState(false)
	const [optionsError, setOptionsError] = useState("")
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
	const [properties, setProperties] = useState<Property[]>([])
	const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
	const [isPropertyModalVisible, setIsPropertyModalVisible] = useState(false)
	const [isLoadingProperties, setIsLoadingProperties] = useState(false)
	const [propertiesError, setPropertiesError] = useState("")
	const [propertySearch, setPropertySearch] = useState("")
	const [productionArea, setProductionArea] = useState("")
	const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
	const [isLoadingLocation, setIsLoadingLocation] = useState(false)

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

	const filteredProperties = useMemo(() => {
		if (!selectedMunicipality) return []
		const search = propertySearch.trim().toLocaleLowerCase("pt-BR")

		return properties.filter(
			(property) =>
				property.municipality_id === selectedMunicipality.id &&
				(!search || property.name.toLocaleLowerCase("pt-BR").includes(search)),
		)
	}, [properties, propertySearch, selectedMunicipality])

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

	async function loadRegistrationOptions() {
		setIsLoadingOptions(true)
		setOptionsError("")
		try {
			const [gendersResponse, rolesResponse] = await Promise.all([
				authApi.get<RegistrationOptionsResponse>("/genders"),
				authApi.get<RegistrationOptionsResponse>("/roles"),
			])
			setGenders(
				gendersResponse.data.data
					.filter((gender) =>
						["female", "male", "other", "not_informed"].includes(gender.value ?? ""),
					)
					.sort((firstGender, secondGender) => firstGender.id - secondGender.id),
			)
			setRoles(
				rolesResponse.data.data.filter((role) =>
					["producer", "buyer"].includes(role.name ?? ""),
				),
			)
		} catch (error) {
			console.error("Falha ao carregar gêneros e perfis:", error)
			setOptionsError("Não foi possível carregar gêneros e perfis.")
		} finally {
			setIsLoadingOptions(false)
		}
	}

	async function loadProperties() {
		setIsLoadingProperties(true)
		setPropertiesError("")
		try {
			const { data } = await authApi.get<PropertiesResponse>("/properties")
			setProperties(data.data)
		} catch (error) {
			console.error("Falha ao carregar propriedades:", error)
			setPropertiesError("Não foi possível carregar as propriedades.")
		} finally {
			setIsLoadingProperties(false)
		}
	}

	useEffect(() => {
		void loadMunicipalities()
		void loadLocalities()
		void loadRegistrationOptions()
		void loadProperties()
	}, [])

	function optionClassName(selected: boolean) {
		return `flex-1 items-center justify-center border p-3 rounded-xl ${
			selected ? "border-primary bg-primaryLight" : "border-gray-300"
		}`
	}

	function handleSelectRole(role: RegistrationOption) {
		setSelectedRole(role)

		if (role.name === "buyer") {
			setSelectedProperty(null)
			setProductionArea("")
			setIsPropertyModalVisible(false)
		}
	}

	async function captureCurrentLocation() {
		setIsLoadingLocation(true)

		try {
			const servicesEnabled = await Location.hasServicesEnabledAsync()
			if (!servicesEnabled) {
				Toast.show({
					type: "info",
					text1: "Localização desativada",
					text2: "Ative a localização do aparelho e tente novamente.",
				})
				return
			}

			const permission = await Location.requestForegroundPermissionsAsync()
			if (permission.status !== Location.PermissionStatus.GRANTED) {
				Toast.show({
					type: "info",
					text1: "Permissão necessária",
					text2: "Permita o acesso à localização para concluir o cadastro.",
				})
				return
			}

			const currentLocation = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.High,
			})

			setCoordinates({
				latitude: currentLocation.coords.latitude,
				longitude: currentLocation.coords.longitude,
			})
			Toast.show({
				type: "success",
				text1: "Localização obtida",
				text2: "As coordenadas foram registradas.",
			})
		} catch (error) {
			console.error("Falha ao obter localização:", error)
			Toast.show({
				type: "error",
				text1: "Erro de localização",
				text2: "Não foi possível obter as coordenadas. Tente novamente.",
			})
		} finally {
			setIsLoadingLocation(false)
		}
	}

	function changeStep(nextStep: 1 | 2 | 3) {
		Keyboard.dismiss()
		setStep(nextStep)
		requestAnimationFrame(() => scrollViewRef.current?.scrollTo({ y: 0, animated: true }))
	}

	function handleNextStep() {
		if (step === 1) {
			const normalizedName = name.trim()
			const normalizedEmail = email.trim()
			const normalizedPhone = phone.replace(/\D/g, "")

			if (
				!normalizedName ||
				(!normalizedEmail && !normalizedPhone) ||
				!selectedGender?.value
			) {
				Toast.show({
					type: "info",
					text1: "Dados pessoais incompletos",
					text2: "Informe nome, gênero e pelo menos e-mail ou telefone.",
				})
				return
			}

			changeStep(2)
			return
		}

		if (!selectedRole || !password || !passwordConfirmation) {
			Toast.show({
				type: "info",
				text1: "Perfil incompleto",
				text2: "Selecione o perfil e preencha a senha e sua confirmação.",
			})
			return
		}

		if (password.length < 8) {
			Toast.show({
				type: "info",
				text1: "Senha inválida",
				text2: "A senha deve ter pelo menos 8 caracteres.",
			})
			return
		}

		if (password !== passwordConfirmation) {
			Toast.show({
				type: "info",
				text1: "Senhas diferentes",
				text2: "As senhas não coincidem.",
			})
			return
		}

		changeStep(3)
	}

	async function handleRegister() {
		const normalizedName = name.trim()
		const normalizedEmail = email.trim().toLowerCase()
		const normalizedPhone = phone.replace(/\D/g, "")

		if (
			!normalizedName ||
			(!normalizedEmail && !normalizedPhone) ||
			!selectedGender?.value ||
			!selectedRole ||
			!selectedMunicipality ||
			!password ||
			!passwordConfirmation
		) {
			Toast.show({
				type: "info",
				text1: "Atenção",
				text2: "Preencha os campos obrigatórios e informe um e-mail ou telefone.",
			})
			return
		}

		if (!coordinates) {
			Toast.show({
				type: "info",
				text1: "Localização necessária",
				text2: "Use sua localização atual antes de concluir o cadastro.",
			})
			return
		}

		if (password.length < 8) {
			Toast.show({
				type: "info",
				text1: "Senha inválida",
				text2: "A senha deve ter pelo menos 8 caracteres.",
			})
			return
		}

		if (password !== passwordConfirmation) {
			Toast.show({
				type: "info",
				text1: "Senhas diferentes",
				text2: "As senhas não coincidem.",
			})
			return
		}

		const isProducer = selectedRole.name === "producer"
		const normalizedProductionArea = productionArea.trim().replace(",", ".")
		const productionAreaValue =
			isProducer && normalizedProductionArea ? Number(normalizedProductionArea) : undefined
		if (
			productionAreaValue !== undefined &&
			(!Number.isFinite(productionAreaValue) || productionAreaValue <= 0)
		) {
			Toast.show({
				type: "info",
				text1: "Área inválida",
				text2: "Informe uma área de produção maior que zero.",
			})
			return
		}

		setIsSubmitting(true)
		Keyboard.dismiss()

		try {
			const payload = {
				name: normalizedName,
				...(normalizedEmail ? { email: normalizedEmail } : {}),
				...(normalizedPhone ? { phone: normalizedPhone } : {}),
				gender: selectedGender.value,
				role_ids: [selectedRole.id],
				municipality_id: selectedMunicipality.id,
				latitude: coordinates.latitude,
				longitude: coordinates.longitude,
				...(selectedLocality ? { locality_id: selectedLocality.id } : {}),
				...(isProducer && selectedProperty
					? {
							property_id: selectedProperty.id,
							property_name: selectedProperty.name,
						}
					: {}),
				...(productionAreaValue !== undefined
					? { production_area_hectares: productionAreaValue }
					: {}),
				password,
				password_confirmation: passwordConfirmation,
			}
			console.log("Dados: " + JSON.stringify(payload))

			await authApi.post("/register", payload)

			Toast.show({
				type: "success",
				text1: "Cadastro realizado",
				text2: "Sua conta foi criada com sucesso.",
			})
			router.replace("/")
		} catch (error) {
			if (!axios.isAxiosError<ApiError>(error)) {
				console.error("Erro inesperado no cadastro:", error)
				Toast.show({
					type: "error",
					text1: "Erro no cadastro",
					text2: "Ocorreu um erro inesperado. Tente novamente.",
				})
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

			Toast.show({ type: "error", text1: "Erro no cadastro", text2: message })
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<ScrollView
			ref={scrollViewRef}
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
				<Text className="text-base font-medium">
					Etapa {step} de 3 ·{" "}
					{step === 1 ? "Dados pessoais" : step === 2 ? "Perfil e acesso" : "Localização"}
				</Text>
				<View className="flex-row gap-2 mb-2">
					{[1, 2, 3].map((item) => (
						<View
							key={item}
							className={`h-2 flex-1 rounded-full ${item <= step ? "bg-secondary" : "bg-gray-200"}`}
						/>
					))}
				</View>

				{step === 1 && (
					<>
						<Field
							className="border border-gray-300 rounded-xl"
							placeholder="Nome completo"
							value={name}
							onChangeText={setName}
							autoCapitalize="words"
						/>
						<Field
							className="border border-gray-300 rounded-xl"
							placeholder="E-mail (opcional se informar telefone)"
							value={email}
							onChangeText={setEmail}
							keyboardType="email-address"
							autoComplete="email"
						/>
						<Field
							className="border border-gray-300 rounded-xl"
							placeholder="Telefone / WhatsApp (opcional se informar e-mail)"
							value={phone}
							onChangeText={setPhone}
							keyboardType="phone-pad"
							autoComplete="tel"
						/>

						<Text className="text-lg font-bold">Gênero</Text>
						<View className="flex-row flex-wrap gap-2">
							{genders.map((gender) => {
								const selected = selectedGender?.id === gender.id
								return (
									<Pressable
										key={gender.id}
										onPress={() => setSelectedGender(gender)}
										className={optionClassName(selected)}
									>
										<Text
											className={
												selected ? "text-white font-medium" : "font-medium"
											}
										>
											{gender.label}
										</Text>
									</Pressable>
								)
							})}
						</View>
					</>
				)}

				{step === 2 && (
					<>
						<Text className="text-lg font-bold">Tipo de perfil</Text>
						<View className="flex-row flex-wrap gap-2">
							{roles.map((role) => {
								const selected = selectedRole?.id === role.id
								return (
									<Pressable
										key={role.id}
										onPress={() => handleSelectRole(role)}
										className={optionClassName(selected)}
									>
										<Text
											className={
												selected ? "text-white font-medium" : "font-medium"
											}
										>
											{role.name === "producer"
												? "Produtor"
												: role.name === "buyer"
													? "Comprador"
													: role.label}
										</Text>
									</Pressable>
								)
							})}
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
					</>
				)}

				{step < 3 && isLoadingOptions && <ActivityIndicator color="#512B76" />}
				{step < 3 && optionsError && (
					<View className="flex-row items-center justify-between">
						<Text className="flex-1 text-sm text-red-500">{optionsError}</Text>
						<Pressable onPress={loadRegistrationOptions} className="px-3 py-2">
							<Text className="font-semibold text-primary">Tentar novamente</Text>
						</Pressable>
					</View>
				)}

				{step === 3 && (
					<>
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
								<Text className="flex-1 text-sm text-red-500">
									{municipalitiesError}
								</Text>
								<Pressable onPress={loadMunicipalities} className="px-3 py-2">
									<Text className="font-semibold text-primary">
										Tentar novamente
									</Text>
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
										: selectedLocality?.name ||
											"Selecione a comunidade (opcional)"}
							</Text>
							{isLoadingLocalities ? (
								<ActivityIndicator size="small" color="#512B76" />
							) : (
								<ChevronDown size={20} />
							)}
						</Pressable>
						{localitiesError && (
							<View className="flex-row items-center justify-between">
								<Text className="flex-1 text-sm text-red-500">
									{localitiesError}
								</Text>
								<Pressable onPress={loadLocalities} className="px-3 py-2">
									<Text className="font-semibold text-primary">
										Tentar novamente
									</Text>
								</Pressable>
							</View>
						)}

						<Text className="text-lg font-bold">Coordenadas geográficas</Text>
						<Pressable
							onPress={captureCurrentLocation}
							disabled={isLoadingLocation}
							className="flex-row items-center border border-primary p-3 rounded-xl gap-3"
						>
							{isLoadingLocation ? (
								<ActivityIndicator size="small" color="#512B76" />
							) : (
								<LocateFixed size={20} color="#512B76" />
							)}
							<View className="flex-1">
								<Text className="font-semibold text-primary">
									{isLoadingLocation
										? "Obtendo localização..."
										: coordinates
											? "Atualizar minha localização"
											: "Usar minha localização atual"}
								</Text>
								<Text className="text-sm text-gray-500">
									{coordinates
										? `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`
										: "Obrigatório para concluir o cadastro"}
								</Text>
							</View>
						</Pressable>

						{selectedRole?.name === "producer" && (
							<>
								<Text className="text-lg font-bold">Produção (opcional)</Text>
								<Pressable
									onPress={() => setIsPropertyModalVisible(true)}
									disabled={!selectedMunicipality || isLoadingProperties}
									className={`flex-row items-center border border-gray-300 p-3 rounded-xl gap-4 ${
										!selectedMunicipality ? "opacity-50" : ""
									}`}
								>
									<MapPin size={20} />
									<Text
										className={`flex-1 text-base font-medium ${
											selectedProperty ? "text-gray-900" : "text-gray-500"
										}`}
									>
										{!selectedMunicipality
											? "Selecione primeiro o município"
											: isLoadingProperties
												? "Carregando propriedades..."
												: selectedProperty?.name ||
													"Selecione a propriedade (opcional)"}
									</Text>
									{isLoadingProperties ? (
										<ActivityIndicator size="small" color="#512B76" />
									) : (
										<ChevronDown size={20} />
									)}
								</Pressable>
								{propertiesError && (
									<View className="flex-row items-center justify-between">
										<Text className="flex-1 text-sm text-red-500">
											{propertiesError}
										</Text>
										<Pressable onPress={loadProperties} className="px-3 py-2">
											<Text className="font-semibold text-primary">
												Tentar novamente
											</Text>
										</Pressable>
									</View>
								)}
								<Field
									className="border border-gray-300 rounded-xl"
									placeholder="Área de produção em hectares (opcional)"
									value={productionArea}
									onChangeText={setProductionArea}
									keyboardType="decimal-pad"
								/>
							</>
						)}
					</>
				)}

				<View className="flex-row gap-3 mt-4">
					{step > 1 && (
						<Button
							onPress={() => changeStep(step === 3 ? 2 : 1)}
							disabled={isSubmitting}
							className="flex-1 flex-row items-center justify-center gap-2 border border-primary p-3 rounded-xl"
						>
							<Button.Icon Icon={ArrowLeft} size={20} color="#512B76" />
							<Button.TextButton
								className="font-semibold text-lg text-primary"
								title="Voltar"
							/>
						</Button>
					)}
					<Button
						onPress={step === 3 ? handleRegister : handleNextStep}
						disabled={isSubmitting}
						className="flex-1 flex-row bg-secondary items-center p-3 rounded-xl"
					>
						<Button.ViewButton className="flex-1 items-center">
							{isSubmitting ? (
								<ActivityIndicator color="white" />
							) : (
								<Button.TextButton
									className="font-semibold text-lg text-white"
									title={step === 3 ? "Cadastrar" : "Continuar"}
								/>
							)}
						</Button.ViewButton>
						{!isSubmitting && <Button.Icon Icon={ArrowRight} size={20} color="white" />}
					</Button>
				</View>
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
												setSelectedProperty(null)
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

			<Modal
				visible={isPropertyModalVisible}
				transparent
				animationType="slide"
				onRequestClose={() => setIsPropertyModalVisible(false)}
			>
				<View className="flex-1 justify-end bg-black/40">
					<View className="max-h-[80%] rounded-t-3xl bg-white px-4 pb-6 pt-4">
						<View className="mb-4 flex-row items-center justify-between">
							<View className="flex-1 pr-4">
								<Text className="text-xl font-bold text-gray-900">
									Selecione a propriedade
								</Text>
								<Text className="text-sm text-gray-500">
									{selectedMunicipality
										? `${selectedMunicipality.name} - ${selectedMunicipality.state}`
										: "Município não selecionado"}
								</Text>
							</View>
							<Pressable
								onPress={() => setIsPropertyModalVisible(false)}
								className="rounded-full bg-gray-100 p-2"
							>
								<X size={22} color="#374151" />
							</Pressable>
						</View>

						<View className="mb-3 flex-row items-center gap-3 rounded-xl border border-gray-300 px-3">
							<Search size={20} color="#6B7280" />
							<Field
								className="flex-1 border-0 px-0"
								placeholder="Buscar propriedade"
								value={propertySearch}
								onChangeText={setPropertySearch}
								autoCapitalize="words"
							/>
						</View>

						<FlatList
							data={filteredProperties}
							keyExtractor={(item) => String(item.id)}
							keyboardShouldPersistTaps="handled"
							showsVerticalScrollIndicator={false}
							ListEmptyComponent={
								<Text className="py-8 text-center text-gray-500">
									Nenhuma propriedade encontrada para este município.
								</Text>
							}
							renderItem={({ item }) => {
								const isSelected = selectedProperty?.id === item.id
								return (
									<Pressable
										onPress={() => {
											setSelectedProperty(item)
											setPropertySearch("")
											setIsPropertyModalVisible(false)
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
