export type UserDTO = {
	id: number
	name: string
	email?: string | null
	phone?: string | null
	gender: string
	profile_type: string
	profile_label: string
	municipality_id: number
	municipality: {
		id: number
		name: string
		state: string
	}
	property_id: number
	production_area_id: number
	community?: string
	locality_id?: number | null
	locality?: {
		id: number
		name: string
	} | null
	latitude: number | string | null
	longitude: number | string | null
	id_device: string | null
	roles: string[]
	permissions: string[]
	active_subscription: unknown | null
	created_at: string
	updated_at: string
}
