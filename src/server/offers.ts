import { server } from "@/server/api"

export type DashboardPeriod = 7 | 15 | 30 | 90

export type DashboardPriceItem = {
	date: string
	average_price: number | null
	offers_count: number
	total_volume_kg: number | null
	variation_percentage: number | null
	trend: string
}

export type PriceDashboard = {
	metadata?: { source: string; updated_at: string | null }
	filters: { municipality_id: number | null; days: number; start_date: string; end_date: string }
	filter_options: {
		municipalities: Array<{ id: number; name: string; state: string | null }>
	}
	summary: DashboardPriceItem & { comparison_days: number }
	chart: DashboardPriceItem[]
	history: { data: DashboardPriceItem[]; current_page: number; last_page: number }
}

export type MunicipalityAveragePrice = {
	municipalityId: number | null
	municipalityName: string
	state: string | null
	averagePrice: number
	offersCount: number | null
	totalVolumeKg: number | null
	calculationDate: string | null
}

function unwrapData(payload: any) {
	return payload?.data?.data ?? payload?.data ?? payload
}

function normalizeAverage(item: any): MunicipalityAveragePrice | null {
	const municipality = item?.municipality ?? item?.city ?? {}
	const averagePrice = Number(
		item?.average_price ??
			item?.averagePrice ??
			item?.avg_price ??
			item?.average ??
			item?.price,
	)
	const municipalityName = String(
		item?.municipality_name ?? municipality?.name ?? item?.name ?? "",
	).trim()

	if (!municipalityName || !Number.isFinite(averagePrice)) return null

	const rawId = item?.municipality_id ?? municipality?.id ?? item?.id
	const municipalityId = Number(rawId)
	const rawCount = item?.offers_count ?? item?.offer_count ?? item?.count ?? item?.total_offers
	const offersCount = Number(rawCount)

	return {
		municipalityId: Number.isInteger(municipalityId) ? municipalityId : null,
		municipalityName,
		state: item?.state ?? municipality?.state ?? null,
		averagePrice,
		offersCount: Number.isFinite(offersCount) ? offersCount : null,
		totalVolumeKg:
			item?.total_volume_kg != null && Number.isFinite(Number(item.total_volume_kg))
				? Number(item.total_volume_kg)
				: null,
		calculationDate: item?.calculation_date ?? item?.calculationDate ?? null,
	}
}

function dateParams(date?: string) {
	return date ? { params: { date } } : undefined
}

export const offersApi = {
	priceDashboard: async (params: {
		municipality_id?: number
		days: DashboardPeriod
		end_date?: string
		page?: number
		per_page?: number
	}) => {
		const response = await server.get<{ data: PriceDashboard }>("/offers/price-dashboard", {
			params,
		})
		return response.data.data
	},

	averagePriceForMyMunicipality: async (date?: string) => {
		const response = await server.get("/offers/average-price/my-municipality", dateParams(date))
		return normalizeAverage(unwrapData(response.data))
	},

	averagePriceByMunicipality: async (date?: string) => {
		const response = await server.get("/offers/average-price/municipalities", dateParams(date))
		const data = unwrapData(response.data)
		const items = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
		return items
			.map(normalizeAverage)
			.filter((item): item is MunicipalityAveragePrice => item !== null)
	},

	averagePricesForDates: async (dates: string[]) => {
		const snapshots: Array<{ date: string; items: MunicipalityAveragePrice[] }> = []
		const batchSize = 6

		for (let index = 0; index < dates.length; index += batchSize) {
			const batch = dates.slice(index, index + batchSize)
			const results = await Promise.allSettled(
				batch.map(async (date) => ({
					date,
					items: await offersApi.averagePriceByMunicipality(date),
				})),
			)

			for (const result of results) {
				if (result.status === "fulfilled") snapshots.push(result.value)
			}
		}

		return snapshots.sort((a, b) => a.date.localeCompare(b.date))
	},
}
