import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import { ChevronLeft } from "lucide-react-native"
import { ReactNode } from "react"
import { Pressable, StatusBar, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type HeaderProps = {
	title?: string
	subtitle?: string
	backgroundColor?: string
	showBack?: boolean
	onBack?: () => void
	leftAction?: ReactNode
	rightAction?: ReactNode
	centerContent?: ReactNode
	children?: ReactNode
	statusBarColor?: string
	gradientColors?: readonly [string, string, ...string[]]
}

function lighten(hex: string, amount = 0.14) {
	const match = hex.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i)
	if (!match) return hex

	const channel = (value: string) =>
		Math.round(Number.parseInt(value, 16) + (255 - Number.parseInt(value, 16)) * amount)
			.toString(16)
			.padStart(2, "0")

	return `#${channel(match[1])}${channel(match[2])}${channel(match[3])}`
}

export function Header({
	title,
	subtitle,
	backgroundColor = "#512B76",
	showBack = false,
	onBack,
	leftAction,
	rightAction,
	centerContent,
	children,
	statusBarColor,
	gradientColors,
}: HeaderProps) {
	const colors = gradientColors ?? ([backgroundColor, lighten(backgroundColor)] as const)
	const left =
		leftAction ??
		(showBack ? (
			<Pressable
				onPress={onBack ?? (() => router.back())}
				accessibilityRole="button"
				accessibilityLabel="Voltar"
				className="h-10 w-10 items-start justify-center"
			>
				<ChevronLeft color="#FFFFFF" size={28} />
			</Pressable>
		) : null)

	return (
		<View style={{ backgroundColor: colors[0] }}>
			<StatusBar
				barStyle="light-content"
				backgroundColor={statusBarColor ?? backgroundColor}
			/>
			<SafeAreaView edges={["top"]} style={{ backgroundColor: colors[0] }} />
			<LinearGradient
				colors={colors}
				start={{ x: 0.5, y: 0 }}
				end={{ x: 0.5, y: 1 }}
				className="px-5 pb-5 pt-3"
				style={{
					overflow: "hidden",
				}}
			>
				<View className="flex-row items-center justify-between gap-3">
					<View className="min-w-10 items-start">{left}</View>

					<View className="flex-1 items-center">
						{centerContent ?? (
							<>
								{title ? (
									<Text className="text-center text-lg font-semibold text-white">
										{title}
									</Text>
								) : null}
								{subtitle ? (
									<Text className="mt-1 text-center text-sm text-purple-200">
										{subtitle}
									</Text>
								) : null}
							</>
						)}
					</View>

					<View className="min-w-10 items-end">{rightAction}</View>
				</View>

				{children ? <View className="mt-4">{children}</View> : null}
			</LinearGradient>
		</View>
	)
}
