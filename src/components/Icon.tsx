import { LucideProps } from "lucide-react-native"

interface ButtonIconProps extends LucideProps {
	Icon: React.ComponentType<LucideProps>
	size?: number
	color?: string
	strokeWidth?: number
}

export function Icon({ Icon, size = 20, strokeWidth = 2, ...rest }: ButtonIconProps) {
	return <Icon size={size} strokeWidth={strokeWidth} {...rest} />
}
