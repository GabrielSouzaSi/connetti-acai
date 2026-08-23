const { withAppBuildGradle } = require("expo/config-plugins")

const PACKAGE_VERSION_MARKER = "def packageJson = new groovy.json.JsonSlurper()"
const APK_NAME_MARKER = 'outputFileName = "${rootProject.name}-${variant.versionName}.apk"'

function addPackageVersion(contents) {
	if (!contents.includes(PACKAGE_VERSION_MARKER)) {
		contents = contents.replace(
			/(def projectRoot = .*\n)/,
			'$1def packageJson = new groovy.json.JsonSlurper().parseText(file("${projectRoot}/package.json").text)\ndef appVersion = packageJson.version\n',
		)
	}

	return contents.replace(/versionName\s+["'][^"']+["']/, "versionName appVersion")
}

function addReleaseApkName(contents) {
	if (contents.includes(APK_NAME_MARKER)) {
		return contents
	}

	const outputConfiguration = `    applicationVariants.all { variant ->
        if (variant.buildType.name == "release") {
            variant.outputs.all { output ->
                outputFileName = "\${rootProject.name}-\${variant.versionName}.apk"
            }
        }
    }
`

	return contents.replace(/(\s+packagingOptions\s*\{)/, `\n${outputConfiguration}$1`)
}

module.exports = function withAndroidVersioning(config) {
	return withAppBuildGradle(config, (gradleConfig) => {
		if (gradleConfig.modResults.language !== "groovy") {
			throw new Error("withAndroidVersioning requer android/app/build.gradle em Groovy")
		}

		gradleConfig.modResults.contents = addReleaseApkName(
			addPackageVersion(gradleConfig.modResults.contents),
		)

		return gradleConfig
	})
}

