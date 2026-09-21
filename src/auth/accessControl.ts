import { UserDTO } from "@/dtos/userDTO"

export const PROFILE_REGISTRY = {
	producer: {
		label: "Produtor",
		aliases: ["producer", "produtor"],
	},
	buyer: {
		label: "Comprador",
		aliases: ["buyer", "comprador"],
	},
} as const

export const FEATURE_ACCESS = {
	manageOffers: {
		roles: ["producer", "buyer"],
		permissions: ["create offers"],
	},
	startNegotiation: {
		permissions: ["create negotiations"],
	},
	manageNegotiations: {
		permissions: ["create negotiations", "manage negotiations"],
	},
} as const

export type Profile = keyof typeof PROFILE_REGISTRY
export type Feature = keyof typeof FEATURE_ACCESS

export function isAdmin(user: UserDTO | null): boolean {
	return user?.roles?.some((role) => role.toLowerCase() === "admin") ?? false
}

export function getUserProfiles(user: UserDTO | null, activeProfile?: Profile | null): string[] {
	if (!user) return []

	const profileType = user.profile_type?.toLowerCase()
	const roles = user.roles?.map((role) => role.toLowerCase()) ?? []
	const profiles = new Set(roles)

	if (isAdmin(user) && activeProfile) {
		return [...roles.filter((role) => !["producer", "buyer", "produtor", "comprador"].includes(role)), activeProfile]
	}

	if (profileType) {
		for (const [profile, definition] of Object.entries(PROFILE_REGISTRY)) {
			if ((definition.aliases as readonly string[]).includes(profileType)) {
				profiles.add(profile)
			}
		}
	}

	return [...profiles]
}

export function hasRole(user: UserDTO | null, ...roles: string[]): boolean {
	const userProfiles = getUserProfiles(user)
	return roles.some((role) => userProfiles.includes(role.toLowerCase()))
}

export function hasPermission(user: UserDTO | null, ...permissions: string[]): boolean {
	if (isAdmin(user)) return true
	const userPermissions = user?.permissions ?? []
	return permissions.some((permission) => userPermissions.includes(permission))
}

export function canAccessFeature(user: UserDTO | null, feature: Feature): boolean {
	if (isAdmin(user)) return true
	const rule: {
		readonly roles?: readonly string[]
		readonly permissions?: readonly string[]
	} = FEATURE_ACCESS[feature]
	const roles = rule.roles ?? []
	const permissions = rule.permissions ?? []

	return (
		(roles.length > 0 && hasRole(user, ...roles)) ||
		(permissions.length > 0 && hasPermission(user, ...permissions))
	)
}
