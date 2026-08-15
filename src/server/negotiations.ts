import { server } from "@/server/api"

export type CreateNegotiationPayload = {
	offer_id: number
	proposed_price: number
	proposed_volume: number
	proposed_unit: string
	message: string
}

export const negotiationsApi = {
	list: () => server.get("/my/negotiations"),
	create: (payload: CreateNegotiationPayload) => server.post("/negotiations", payload),
	accept: (id: number) => server.patch(`/negotiations/${id}/accept`, {}),
	reject: (id: number) => server.patch(`/negotiations/${id}/reject`, {}),
	complete: (id: number) => server.patch(`/negotiations/${id}/complete`, {}),
	cancel: (id: number) => server.patch(`/negotiations/${id}/cancel`, {}),
	sendMessage: (id: number, message: string) =>
		server.post(`/negotiations/${id}/messages`, { message }),
	createPayment: (id: number) => server.post(`/negotiations/${id}/payments`, {}),
}
