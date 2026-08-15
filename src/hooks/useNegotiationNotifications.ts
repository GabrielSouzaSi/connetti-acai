import { useEffect } from "react"
import { AppState } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { getNegotiationParties } from "@/utils/negotiationRoles"
import { negotiationsApi } from "@/server/negotiations"
import { scheduleNegotiationProposalNotification } from "@/services/notifications"

const POLLING_INTERVAL_MS = 30_000

type Negotiation = Record<string, any> & { id: number }

function getNegotiations(response: any): Negotiation[] {
	const data = response?.data?.data

	if (Array.isArray(data)) return data
	if (Array.isArray(data?.data)) return data.data

	return []
}

function storageKey(userId: number) {
	return `@collegaacai:received-negotiations:${userId}`
}

export function useNegotiationNotifications(userId?: number | string) {
	useEffect(() => {
		const currentUserId = Number(userId)

		if (!Number.isInteger(currentUserId) || currentUserId <= 0) return

		let cancelled = false
		let syncing = false

		async function syncNegotiations() {
			if (cancelled || syncing || AppState.currentState !== "active") return

			syncing = true

			try {
				const response = await negotiationsApi.list()
				if (cancelled) return

				const received = getNegotiations(response).filter((negotiation) => {
					return getNegotiationParties(negotiation, currentUserId).amOwner
				})
				const key = storageKey(currentUserId)
				const storedIds = await AsyncStorage.getItem(key)
				const currentIds = received.map((negotiation) => Number(negotiation.id))
					.filter((id) => Number.isInteger(id) && id > 0)

				if (storedIds === null) {
					await AsyncStorage.setItem(key, JSON.stringify(currentIds))
					return
				}

				const knownIds = new Set<number>(JSON.parse(storedIds))
				const newNegotiations = received.filter(
					(negotiation) => !knownIds.has(Number(negotiation.id)),
				)

				if (newNegotiations.length === 0) return

				await AsyncStorage.setItem(
					key,
					JSON.stringify([...new Set([...knownIds, ...currentIds])]),
				)

				for (const negotiation of newNegotiations) {
					await scheduleNegotiationProposalNotification(negotiation)
				}
			} catch (error) {
				console.error("[Notificação] Erro ao verificar novas propostas", error)
			} finally {
				syncing = false
			}
		}

		void syncNegotiations()

		const interval = setInterval(() => void syncNegotiations(), POLLING_INTERVAL_MS)
		const appStateSubscription = AppState.addEventListener("change", (state) => {
			if (state === "active") void syncNegotiations()
		})

		return () => {
			cancelled = true
			clearInterval(interval)
			appStateSubscription.remove()
		}
	}, [userId])
}
