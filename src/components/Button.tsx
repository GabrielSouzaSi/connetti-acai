import clsx from "clsx"
import { ReactNode } from "react"
import {
	Text,
	TextProps,
	TouchableOpacity,
	TouchableOpacityProps,
	View,
	ViewProps,
} from "react-native"
import { Icon } from "./Icon"

type ButtonProps = TouchableOpacityProps & {
	children: ReactNode
}

type TextButtonProps = TextProps & {
	title: string
}

type ViewButtonProps = ViewProps & {
	children: ReactNode
}

function Button({ children, className, disabled, ...rest }: ButtonProps & { disabled?: boolean }) {
	return (
		<TouchableOpacity
			className={clsx("w-full", { "opacity-60 bg-gray-400": disabled }, className)}
			{...rest}
		>
			{children}
		</TouchableOpacity>
	)
}

function TextButton({ title, className, ...rest }: TextButtonProps) {
	return (
		<Text className={clsx(className)} {...rest}>
			{title}
		</Text>
	)
}

function ViewButton({ children, className, ...rest }: ViewButtonProps) {
	return (
		<View className={clsx(className)} {...rest}>
			{children}
		</View>
	)
}

Button.TextButton = TextButton
Button.Icon = Icon
Button.ViewButton = ViewButton

export { Button }
