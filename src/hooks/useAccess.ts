import {
	canAccessFeature,
	Feature,
	getUserProfiles,
	hasPermission,
	hasRole,
} from "@/auth/accessControl"
import { useAuth } from "@/hooks/useAuth"
import { useCallback, useMemo } from "react"

export function useAccess() {
	const { user } = useAuth()

	const roles = useMemo(() => getUserProfiles(user), [user])
	const is = useCallback((...profiles: string[]) => hasRole(user, ...profiles), [user])
	const can = useCallback(
		(...permissions: string[]) => hasPermission(user, ...permissions),
		[user],
	)
	const canAccess = useCallback(
		(feature: Feature) => canAccessFeature(user, feature),
		[user],
	)

	return { roles, is, can, canAccess }
}
