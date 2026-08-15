import { AcaiOffer } from "@/components/AcaiCard"

export type PricePeriod = 7 | 30 | 90 | 0

export type PriceHistoryItem = {
	date: string
	isoDate: string
	price: number
	variation: number | null
	offers: number
}

export function formatCurrency(value: number) {
	return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function getOfferDate(offer: AcaiOffer) {
	return offer.dates?.offer_date || offer.dates?.created_at
}

export function getMunicipalityKey(offer: AcaiOffer) {
	return `${offer.municipality.name} - ${offer.municipality.state}`
}

function getPricePerKg(offer: AcaiOffer) {
	const price = Number(offer.price)
	const originalVolume = Number(offer.volume?.original)
	const kgVolume = Number(offer.volume?.kg)
	if (!Number.isFinite(price)) return null
	if (offer.volume?.unit?.toLocaleLowerCase("pt-BR") === "kg") return price
	if (originalVolume > 0 && kgVolume > 0) return price / (kgVolume / originalVolume)
	return null
}

export function buildPriceHistory(
	offers: AcaiOffer[],
	municipality: string,
	period: PricePeriod,
) {
	const datedOffers = offers
		.filter((offer) => municipality === "all" || getMunicipalityKey(offer) === municipality)
		.map((offer) => ({ offer, pricePerKg: getPricePerKg(offer), date: new Date(String(getOfferDate(offer)).replace(" ", "T")) }))
		.filter(({ pricePerKg, date }) => pricePerKg !== null && !Number.isNaN(date.getTime()))

	const latestDate = datedOffers.reduce<Date | null>(
		(latest, item) => (!latest || item.date > latest ? item.date : latest),
		null,
	)
	const startDate = latestDate && period
		? new Date(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate() - period + 1)
		: null

	const grouped = new Map<string, number[]>()
	for (const { pricePerKg, date } of datedOffers) {
		if (startDate && date < startDate) continue
		const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
		grouped.set(key, [...(grouped.get(key) ?? []), pricePerKg as number])
	}

	const ascending = [...grouped.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([isoDate, prices]) => ({
			isoDate,
			date: new Date(`${isoDate}T12:00:00`).toLocaleDateString("pt-BR"),
			price: prices.reduce((sum, price) => sum + price, 0) / prices.length,
			offers: prices.length,
			variation: null as number | null,
		}))

	ascending.forEach((item, index) => {
		const previous = ascending[index - 1]
		if (previous?.price) item.variation = ((item.price - previous.price) / previous.price) * 100
	})

	return ascending.reverse() as PriceHistoryItem[]
}
