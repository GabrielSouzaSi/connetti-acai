import MunicipalityAveragesScreen from "@/app/pages/municipalityAverages"

export default function PageBuyerHomeScreen() {
	return (
		<MunicipalityAveragesScreen
			embedded
			selectable
			allowDateSelection={false}
			title="Médias por município"
			subtitle="Selecione um município para ver as ofertas"
		/>
	)
}
