import { Header } from "@/components/Header"
import { useAuth } from "@/hooks/useAuth"
import { Building2, Mail, MapPin, Phone, UserRound } from "lucide-react-native"
import { ScrollView, Text, View } from "react-native"

type FieldProps = {
	icon: typeof UserRound
	label: string
	value?: string | null
}

function Field({ icon: Icon, label, value }: FieldProps) {
	return (
		<View className="flex-row items-center border-b border-gray-100 px-4 py-4 last:border-b-0">
			<View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-purple-100">
				<Icon size={20} color="#512B76" />
			</View>
			<View className="flex-1">
				<Text className="text-xs font-medium uppercase tracking-wide text-gray-500">
					{label}
				</Text>
				<Text className="mt-1 text-base font-semibold text-gray-900">
					{value || "Não informado"}
				</Text>
			</View>
		</View>
	)
}

export default function PersonalDataScreen() {
	const { user } = useAuth()
	const location = user?.municipality
		? `${user.municipality.name} - ${user.municipality.state}`
		: user?.community

	return (
		<View className="flex-1 bg-gray-50">
			<Header title="Dados pessoais" subtitle="Informações da sua conta" showBack />
			<ScrollView contentContainerClassName="p-5 pb-10" showsVerticalScrollIndicator={false}>
				<View className="overflow-hidden rounded-2xl bg-white">
					<Field icon={UserRound} label="Nome" value={user?.name} />
					<Field icon={Mail} label="E-mail" value={user?.email} />
					<Field icon={Phone} label="Telefone" value={user?.phone} />
					<Field icon={MapPin} label="Município" value={location} />
					<Field icon={Building2} label="Propriedade" value={user?.property_name} />
				</View>
				<View className="mt-5 rounded-2xl border border-purple-100 bg-purple-50 p-4">
					<Text className="font-semibold text-purple-900">
						Precisa alterar algum dado?
					</Text>
					<Text className="mt-1 leading-5 text-purple-700">
						Entre em contato com o suporte para manter seus dados cadastrais
						atualizados.
					</Text>
				</View>
			</ScrollView>
		</View>
	)
}
