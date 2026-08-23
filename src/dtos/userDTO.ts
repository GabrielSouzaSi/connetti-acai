export type MunicipalityDTO = {
	id: number
	name: string
	state: string
}

export type LocalityDTO = {
	id: number
	name: string
}

export type PropertyDTO = Record<string, unknown>

export type SubscriptionPlanDTO = {
	id: number
	name: string
	slug: string
}

export type ActiveSubscriptionDTO = {
	id: number
	status: string
	starts_at: string
	ends_at: string | null
	plan: SubscriptionPlanDTO
}

export type UserDTO = {
	id: number
	name: string
	email?: string | null
	phone?: string | null
	gender: string
	profile_type: string
	profile_label: string
	municipality_id: number
	municipality: MunicipalityDTO
	locality_id: number | null
	locality: LocalityDTO | null
	property_name: string | null
	property_id: number | null
	property: PropertyDTO | null
	production_area_hectares: number | null
	latitude: number | string | null
	longitude: number | string | null
	id_device: string | null
	roles: string[]
	permissions: string[]
	active_subscription: ActiveSubscriptionDTO | null
	created_at: string
	updated_at: string
	/** Campo legado, mantido para usuários persistidos por versões anteriores. */
	community?: string
}

export type LoginResponseDTO = {
	message: string
	user: UserDTO
	token: string
	token_type: "Bearer"
}
