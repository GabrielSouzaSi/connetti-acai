import { UpgradePlanModal } from "@/components/UpgradePlanModal"
import { useAccess } from "@/hooks/useAccess"
import { useAuth } from "@/hooks/useAuth"
import { useIsFocused } from "@react-navigation/native"
import { useEffect, useState } from "react"

export function useMunicipalityOffers() {
	const { user } = useAuth()
	const { isAdmin } = useAccess()
	const isFocused = useIsFocused()
	const [visible, setVisible] = useState(false)
	const slug = user?.active_subscription?.plan.slug?.toLowerCase()
	const hasAccess = isAdmin || Boolean(slug && !["free", "gratuito"].includes(slug))

	useEffect(() => {
		if (!isFocused) setVisible(false)
	}, [isFocused])

	function requestAccess(onAllowed: () => void) {
		if (hasAccess) onAllowed()
		else setVisible(true)
	}

	return {
		requestAccess,
		modal: (
			<UpgradePlanModal
				visible={visible && isFocused && !hasAccess}
				onClose={() => setVisible(false)}
				title="Ofertas exclusivas para assinantes"
				description="Assine um plano pago para acessar as ofertas dos municípios e outros recursos exclusivos."
			/>
		),
	}
}
