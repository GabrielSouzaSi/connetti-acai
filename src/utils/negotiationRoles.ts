type Entity = Record<string, any> | null | undefined

export function getNegotiationId(negotiation: Entity) {
	const id = Number(
		negotiation?.negotiation_id ??
		negotiation?.negotiation?.id ??
		negotiation?.id,
	)

	return Number.isInteger(id) && id > 0 ? id : null
}

export function normalizeOfferType(type: unknown) {
	return String(type ?? "").trim().toLowerCase()
}

export function isSaleOffer(offer: Entity) {
	const type = normalizeOfferType(offer?.type ?? offer?.offer_type?.value)
	return ["sell", "seller", "sale", "venda", "vendedor", "producer", "produtor", "2"].includes(type)
}

export function getOfferOwnerId(offer: Entity) {
	return Number(offer?.user_id ?? offer?.owner_id ?? offer?.producer_id ?? offer?.seller_id ?? offer?.user?.id) || null
}

export function getNegotiationBuyerId(negotiation: Entity) {
	return Number(
		negotiation?.buyer_id ??
		negotiation?.proposer_id ??
		negotiation?.created_by ??
		negotiation?.user_id ??
		negotiation?.buyer?.id ??
		negotiation?.proposer?.id,
	) || null
}

export function getNegotiationProposer(negotiation: Entity) {
	const offerOwnerId = getOfferOwnerId(negotiation?.offer)
	const candidates = [
		negotiation?.proposer,
		negotiation?.buyer,
		negotiation?.created_by_user,
		negotiation?.initiator,
		negotiation?.user,
		negotiation?.counterpart,
		negotiation?.other_user,
	]

	return candidates.find((candidate) => {
		if (!candidate || typeof candidate !== "object") return false
		const candidateId = Number(candidate.id ?? candidate.user_id) || null
		return !offerOwnerId || !candidateId || candidateId !== offerOwnerId
	}) ?? null
}

export function getOfferOwner(offer: Entity) {
	return offer?.user ?? offer?.owner ?? offer?.producer ?? offer?.seller ?? null
}

export function getNegotiationParties(negotiation: Entity, currentUserId?: number) {
	const offer = negotiation?.offer ?? {}
	const ownerId = getOfferOwnerId(offer) ?? (Number(negotiation?.seller_id ?? negotiation?.producer_id) || null)
	const buyerId = getNegotiationBuyerId(negotiation)
	const currentId = Number(currentUserId) || null
	const amOwner = Boolean(currentId && ownerId && currentId === ownerId)
	const amBuyer = Boolean(currentId && !amOwner && (!buyerId || currentId === buyerId))

	return { ownerId, buyerId, amOwner, amBuyer }
}
