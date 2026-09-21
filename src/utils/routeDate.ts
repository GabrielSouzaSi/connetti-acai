/** Accept only real calendar dates in the API's YYYY-MM-DD format. */
export function routeDate(value: string | string[] | undefined): string | undefined {
	if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
	const parsed = new Date(`${value}T12:00:00Z`)
	return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
		? value
		: undefined
}
