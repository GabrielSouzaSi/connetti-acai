const { version } = require("./package.json")

export default () => ({
	expo: {
		name: "Connetti Açaí",
		slug: "connetti-acai",
		version: "1.0.0",
		orientation: "portrait",
		icon: "./assets/images/icon.png",
		scheme: "collegaacai",
		userInterfaceStyle: "automatic",
		newArchEnabled: true,
		splash: {
			image: "./assets/images/splash-icon.png",
			resizeMode: "contain",
			backgroundColor: "#ffffff",
		},
		ios: {
			supportsTablet: true,
		},
		android: {
			versionCode: parseInt(version.split(".").join("")),
			adaptiveIcon: {
				foregroundImage: "./assets/images/adaptive-icon.png",
				backgroundColor: "#ffffff",
			},
			softwareKeyboardLayoutMode: "resize",
			edgeToEdgeEnabled: true,
			predictiveBackGestureEnabled: false,
			package: "com.gabrielsouza.collegaacai",
		},
		web: {
			bundler: "metro",
			output: "static",
			favicon: "./assets/images/favicon.png",
		},
		plugins: [
			"./plugins/withAndroidVersioning",
			"expo-router",
			"expo-notifications",
			[
				"expo-location",
				{
					locationWhenInUsePermission:
						"Permita que o Connetti Açaí use sua localização no cadastro e para publicar ofertas próximas aos compradores.",
				},
			],
		],
		experiments: {
			typedRoutes: true,
		},
	},
})
