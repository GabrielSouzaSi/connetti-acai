import { useAuth } from "@/hooks/useAuth"
import { BadgeCheck, CircleUserRound, CreditCard, MapPin, Star } from "lucide-react-native"
import { Text, View } from "react-native"

type ProfileProps = {
	plan?: boolean
	assessment?: boolean
}

export function Profile({ plan = false, assessment = false }: ProfileProps) {
	const { user } = useAuth()
	const activeSubscription = user?.active_subscription ?? null

	return (
		<View className="px-5 pt-6 pb-6 rounded-2xl border border-zinc-200 bg-white mt-3 mx-4">
			<View className="flex-row items-center gap-4">
				<View className="w-20 h-20 rounded-full bg-purple-100 items-center justify-center">
					<CircleUserRound size={40} color="#512B76" />
				</View>
				{/* <Image
							source={{
								uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
							}}
							className="w-20 h-20 rounded-full"
						/> */}

				<View className="flex-1">
					<Text className="text-xl font-bold text-gray-900">{user?.name}</Text>

					<View className="flex-row items-center mt-1">
						<MapPin size={16} color="#6B7280" />
						<Text className="text-gray-500 ml-1">
							{user?.municipality
								? `${user.municipality.name} - ${user.municipality.state}`
								: user?.community}
						</Text>
					</View>

					<View className="flex-row items-center mt-1">
						<BadgeCheck size={16} color="#22C55E" />
						<Text className="text-green-600 ml-1 font-medium">
							{user?.profile_label ?? "Perfil verificado"}
						</Text>
					</View>

					{plan && (
						<View className="flex-row items-center mt-1">
							<CreditCard size={16} color="#512B76" />
							<Text className="text-purple-800 ml-1 font-semibold">
								{activeSubscription
									? `Plano ${activeSubscription.plan.name}`
									: "Sem plano ativo"}
							</Text>
						</View>
					)}
				</View>
			</View>

			{assessment && (
				<View className="flex-row items-center mt-5">
					{Array.from({ length: 5 }).map((_, index) => (
						<Star
							key={index}
							size={18}
							color="#F59E0B"
							fill="#F59E0B"
							className="mr-1"
						/>
					))}

					<Text className="text-gray-700 ml-2 font-semibold">4,8</Text>
					<Text className="text-gray-500 ml-1">(128 avaliações)</Text>
				</View>
			)}
		</View>
	)
}
