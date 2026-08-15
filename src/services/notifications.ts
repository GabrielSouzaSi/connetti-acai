import * as Notifications from "expo-notifications"
import { Platform } from "react-native"

export const DEFAULT_NOTIFICATION_CHANNEL = "default"

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldPlaySound: true,
		shouldSetBadge: false,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
})

export async function configureNotifications() {
	if (Platform.OS === "web") return false

	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync(
			DEFAULT_NOTIFICATION_CHANNEL,
			{
				name: "Notificações gerais",
				importance: Notifications.AndroidImportance.HIGH,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: "#6F2C91",
			},
		)
	}

	const currentPermission = await Notifications.getPermissionsAsync()

	if (currentPermission.status === "granted") return true

	const requestedPermission = await Notifications.requestPermissionsAsync()

	return requestedPermission.status === "granted"
}

type LocalNotificationOptions = {
	title: string
	body: string
	url?: string
	seconds?: number
}

export async function scheduleLocalNotification({
	title,
	body,
	url,
	seconds = 2,
}: LocalNotificationOptions) {
	const hasPermission = await configureNotifications()

	if (!hasPermission) {
		throw new Error("Permissão para notificações não concedida.")
	}

	return Notifications.scheduleNotificationAsync({
		content: {
			title,
			body,
			data: url ? { url } : undefined,
			sound: "default",
		},
		trigger: {
			type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
			seconds,
			channelId: DEFAULT_NOTIFICATION_CHANNEL,
		},
	})
}

export function scheduleOfferNotification() {
	return scheduleLocalNotification({
		title: "Nova oferta de açaí 🫐",
		body: "Uma nova oferta foi publicada perto de você.",
		url: "/pages/myOffers",
	})
}

export function scheduleNegotiationProposalNotification(
	negotiation: Record<string, any>,
) {
	const counterpart =
		negotiation.counterpart ??
		negotiation.other_user ??
		negotiation.buyer ??
		negotiation.proposer
	const price = Number(negotiation.proposed_price ?? negotiation.price)
	const priceLabel = Number.isFinite(price)
		? ` de R$ ${price.toFixed(2).replace(".", ",")}`
		: ""
	const senderLabel = counterpart?.name ? ` de ${counterpart.name}` : ""

	return scheduleLocalNotification({
		title: "Nova proposta de negociação 🤝",
		body: `Você recebeu uma proposta${senderLabel}${priceLabel}.`,
		url: "/(tabs)/message",
		seconds: 1,
	})
}
