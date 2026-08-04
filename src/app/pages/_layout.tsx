import { useAccess } from "@/hooks/useAccess"
import { Stack } from "expo-router"

export default function PagesLayout() {
	const { canAccess } = useAccess()

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />

			<Stack.Protected guard={canAccess("manageOffers")}>
				<Stack.Screen name="createSale" />
				<Stack.Screen name="myOffers" />
			</Stack.Protected>

			<Stack.Protected guard={canAccess("manageNegotiations")}>
				<Stack.Screen name="negotiation" />
			</Stack.Protected>

			<Stack.Screen name="chat" />
			<Stack.Screen name="offerDetails" />
			<Stack.Screen name="plans" />
		</Stack>
	)
}
