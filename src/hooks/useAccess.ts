import {
	canAccessFeature,
	Feature,
	getUserProfiles,
	hasPermission,
	isAdmin,
} from "@/auth/accessControl"
import { useAuth } from "@/hooks/useAuth"
import { useCallback, useMemo } from "react"

export function useAccess() {
	const { user, activeProfile } = useAuth()

	const roles = useMemo(() => getUserProfiles(user, activeProfile), [user, activeProfile])
	const is = useCallback((...profiles: string[]) => profiles.some((profile) => roles.includes(profile.toLowerCase())), [roles])
	const can = useCallback(
		(...permissions: string[]) => hasPermission(user, ...permissions),
		[user],
	)
	const canAccess = useCallback(
		(feature: Feature) => canAccessFeature(user, feature),
		[user],
	)

	return { roles, is, can, canAccess, isAdmin: isAdmin(user) }
}
