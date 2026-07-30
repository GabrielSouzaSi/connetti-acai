export type UserDTO = {
	id: number
	name: string
	email: string
	phone: string
	gender: string
	profile_type: string
	profile_label: string
	municipality_id: number
	municipality: {
		id: number
		name: string
		state: string
	}
	community: string
	latitude: string
	longitude: string
	id_device: string
	roles: string[]
	permissions: string[]
	active_subscription: unknown | null
	created_at: string
	updated_at: string
}
