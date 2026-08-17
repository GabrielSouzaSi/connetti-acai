export const UNIT_KG = {
	kg: 1,
	lata: 14,
	tela: 28,
} as const

export type OfferUnit = keyof typeof UNIT_KG

export type UnitValue = {
	unit: OfferUnit
	quantity: number
	unitPrice: number
	total: number
}

function normalizeUnit(value: unknown): OfferUnit | null {
	const normalized = String(value ?? "")
		.trim()
		.toLocaleLowerCase("pt-BR")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")

	if (normalized === "kg" || normalized === "quilo" || normalized === "quilos") return "kg"
	if (normalized === "lata" || normalized === "latas") return "lata"
	if (normalized === "tela" || normalized === "telas" || normalized === "tala" || normalized === "talas") return "tela"

	return null
}

export function calculateOfferValues(
	quantity: number,
	unit: unknown,
	unitPrice: number,
): Record<OfferUnit, UnitValue> | null {
	const normalizedUnit = normalizeUnit(unit)

	if (
		!normalizedUnit ||
		!Number.isFinite(quantity) ||
		quantity < 0 ||
		!Number.isFinite(unitPrice) ||
		unitPrice < 0
	) {
		return null
	}

	const totalKg = quantity * UNIT_KG[normalizedUnit]
	const pricePerKg = unitPrice / UNIT_KG[normalizedUnit]
	const total = quantity * unitPrice

	return {
		kg: {
			unit: "kg",
			quantity: totalKg,
			unitPrice: pricePerKg,
			total,
		},
		lata: {
			unit: "lata",
			quantity: totalKg / UNIT_KG.lata,
			unitPrice: pricePerKg * UNIT_KG.lata,
			total,
		},
		tela: {
			unit: "tela",
			quantity: totalKg / UNIT_KG.tela,
			unitPrice: pricePerKg * UNIT_KG.tela,
			total,
		},
	}
}

export function formatOfferCurrency(value: number) {
	if (!Number.isFinite(value)) return "—"

	return value.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})
}

export function formatOfferQuantity(value: number) {
	if (!Number.isFinite(value)) return "—"

	return value.toLocaleString("pt-BR", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	})
}
