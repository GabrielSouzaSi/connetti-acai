// index.tsx
import { Button } from "@/components/Button"
import { Field } from "@/components/input"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "expo-router"
import React, { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import {
	Alert,
	Image,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StatusBar,
	Text,
	View,
} from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"

type FormData = {
	email: string
	password: string
}

export default function App() {
	const router = useRouter()

	const { signIn } = useAuth()

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>()

	const [isLoading, setIsLoading] = useState(false)

	async function handleSignIn({ email, password }: FormData) {
		setIsLoading(true)
		try {
			await signIn(email.toLowerCase(), password)
			// Toast.show({
			// 	type: "success",
			// 	text1: "Login realizado!",
			// 	text2: "Bem-vindo ao AppFiscal!",
			// })
		} catch (error) {
			console.log("Error handleSignIn =>", error)
			// Toast.show({
			// 	type: "error",
			// 	text1: "Não foi possível fazer login",
			// 	text2: "Verifique seus dados e tente novamente.",
			// })
			Alert.alert(
				"Erro",
				"Não foi possível fazer login. Verifique seus dados e tente novamente.",
			)
		} finally {
			Keyboard.dismiss()
			setIsLoading(false)
		}
	}
	return (
		<SafeAreaProvider>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<ScrollView
					showsHorizontalScrollIndicator={false}
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

						<View className="flex-1 px-10 bg-background justify-center gap-5">
							<View className="items-center">
								<Image
									className="w-full h-64"
									source={require("@/assets/home.png")}
									resizeMode="contain"
								/>
							</View>

							<Text className="text-2xl font-bold text-center text-primary">
								Conectando produtores{"\n"} e compradores de açaí{"\n"} da Amazônia.
							</Text>

							<View className="flex-row justify-center items-center">
								<View className="w-4 h-4 bg-secondary rounded-full mr-2"></View>
								<View className="w-4 h-4 bg-primaryLight rounded-full mr-2"></View>
								<View className="w-4 h-4 bg-primaryLight rounded-full mr-2"></View>
								<View className="w-4 h-4 bg-primaryLight rounded-full mr-2"></View>
							</View>

							{/* <TouchableOpacity className="w-full mt-10 bg-secondary py-3 rounded-2xl items-center">
				<Text className="text-white text-2xl font-semibold">Entrar</Text>
			</TouchableOpacity> */}

							<View className="gap-3">
								<Controller
									control={control}
									name="email"
									rules={{
										required: "Informe o e-mail!",
										// pattern: {
										//   value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
										//   message: "E-mail inválido",
										// },
									}}
									render={({ field: { onChange } }) => (
										<Field
											className={`${!!errors.email ? "border-red-500" : ""}`}
											placeholder="E-mail"
											onChangeText={onChange}
										/>
									)}
								/>

								{errors.email?.message && (
									<Text className="font-regular font-bold text-lg text-red-500">
										{errors.email.message}
									</Text>
								)}

								<Controller
									control={control}
									name="password"
									rules={{ required: "Informe a senha!" }}
									render={({ field: { onChange } }) => (
										<Field
											className={`mt-5 ${
												!!errors.password ? "border-red-500" : ""
											}`}
											placeholder="Senha"
											secureTextEntry
											textContentType="password"
											onChangeText={onChange}
											onSubmitEditing={() => handleSubmit(handleSignIn)}
											returnKeyType="send"
										/>
									)}
								/>
								{errors.password?.message && (
									<Text className="font-regular font-bold text-lg text-red-500">
										{errors.password.message}
									</Text>
								)}

								<Button
									onPress={handleSubmit(handleSignIn)}
									className="bg-secondary py-3 items-center rounded-3xl"
								>
									{!isLoading ? (
										<Button.TextButton
											title="Entrar"
											className="font-semibold text-2xl text-white"
										/>
									) : (
										<Button.ViewButton className="">
											<View className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
										</Button.ViewButton>
									)}
								</Button>

								<Button
									onPress={() => router.push("/auth/register")}
									className="bg-transparent py-3 items-center border-2 rounded-3xl border-textLight"
								>
									<Button.TextButton
										className="font-semibold text-2xl"
										title="Criar Conta"
									/>
								</Button>
							</View>

							<Text className="text-2xl font-bold text-center text-primary">
								Fortalecendo nossa floresta{"\n"} e nossa economia.
							</Text>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaProvider>
	)
}
