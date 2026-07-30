import { useAuth } from "@/hooks/useAuth"
import PageBuyerHomeScreen from "../pages/buyer/home"
import PageProducerHomeScreen from "../pages/producer/home"

export default function TabHomeScreen() {
	const { user } = useAuth()

	if (user?.roles[0] === "producer") {
		return <PageProducerHomeScreen />
	} else if (user?.roles[0] === "buyer") {
		return <PageBuyerHomeScreen />
	}
}
