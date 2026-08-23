import { Header } from "@/components/Header"
import { useAuth } from "@/hooks/useAuth"
import { BadgeCheck, CheckCircle2, FileCheck2, ShieldCheck } from "lucide-react-native"
import { ScrollView, Text, View } from "react-native"

export default function VerificationScreen() {
	const { user } = useAuth()

	return (
		<View className="flex-1 bg-gray-50">
			<Header title="Verificação" subtitle="Segurança e confiança" showBack />
			<ScrollView contentContainerClassName="p-5 pb-10" showsVerticalScrollIndicator={false}>
				<View className="items-center rounded-3xl bg-white p-6">
					<View className="h-20 w-20 items-center justify-center rounded-full bg-green-100">
						<BadgeCheck size={42} color="#16A34A" />
					</View>
					<Text className="mt-4 text-xl font-bold text-gray-900">Cadastro ativo</Text>
					<Text className="mt-2 text-center leading-5 text-gray-500">
						Seu tipo de perfil está registrado como {user?.profile_label ?? "usuário"}.
					</Text>
				</View>

				<Text className="mb-3 mt-6 text-lg font-bold text-gray-900">Status da conta</Text>
				<View className="overflow-hidden rounded-2xl bg-white">
					{[
						{
							icon: ShieldCheck,
							title: "Perfil cadastrado",
							text: user?.profile_label ?? "Tipo de perfil informado",
						},
						{
							icon: FileCheck2,
							title: "Localização cadastrada",
							text: user?.municipality
								? `${user.municipality.name} - ${user.municipality.state}`
								: "Localização não informada",
						},
						{
							icon: CheckCircle2,
							title: "Conta ativa",
							text: "Acesso liberado aos recursos do seu perfil",
						},
					].map(({ icon: Icon, title, text }, index) => (
						<View
							key={title}
							className={`flex-row items-center p-4 ${index < 2 ? "border-b border-gray-100" : ""}`}
						>
							<View className="mr-4 h-11 w-11 items-center justify-center rounded-full bg-green-100">
								<Icon size={22} color="#16A34A" />
							</View>
							<View className="flex-1">
								<Text className="font-semibold text-gray-900">{title}</Text>
								<Text className="mt-0.5 text-sm text-gray-500">{text}</Text>
							</View>
							<Text className="font-semibold text-green-600">Concluído</Text>
						</View>
					))}
				</View>
			</ScrollView>
		</View>
	)
}
