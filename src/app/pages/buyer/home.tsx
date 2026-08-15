import MunicipalityAveragesScreen from "@/app/pages/municipalityAverages"

export default function PageBuyerHomeScreen() {
	return (
		<MunicipalityAveragesScreen
			embedded
			selectable={false}
			title="Médias por município"
			subtitle="Acompanhe os preços médios do açaí"
		/>
	)
}
