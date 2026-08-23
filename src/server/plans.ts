import { server } from "@/server/api"

export type PlanFeatures = {
	has_basic_chat: boolean
	has_simple_route: boolean
	has_price_history: boolean
	has_price_alerts: boolean
	has_premium_map: boolean
	has_advanced_filters: boolean
	has_reports: boolean
	has_comparisons: boolean
	has_performance_metrics: boolean
	has_territorial_dashboard: boolean
	has_data_export: boolean
	has_multiple_users: boolean
}

export type Plan = {
	id: number
	name: string
	slug: string
	monthly_price: number
	stripe_price_id: string | null
	offer_limit: number | null
	features: PlanFeatures
	is_active: boolean
}

type PlansResponse = {
	message: string
	data: Plan[]
}

export type PaidSubscriptionPayload = {
	stripe_subscription_id: string
	stripe_customer_id: string
}

export const plansApi = {
	async list() {
		const response = await server.get<PlansResponse>("/plans")
		return response.data.data.filter((plan) => plan.is_active)
	},

	subscribe(plan: Plan, payload?: PaidSubscriptionPayload) {
		return plan.monthly_price === 0
			? server.post(`/plans/${plan.id}/subscribe`)
			: server.post(`/plans/${plan.id}/subscribe`, payload)
	},
}
