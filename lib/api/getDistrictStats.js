import axios from "axios"
import { getDistrictName } from '../components/DistrictList'

const api = axios.create({
    baseURL: `https://keralastats.coronasafe.live`,
})

async function getDistrictStats(query) {

    const name = getDistrictName(query)
    
    const covid = await api.get('/histories.json').then(function (response){
        return response.data.histories
    }, (error) => { console.log(error); })

    const vac = await api.get('/vaccination_histories.json').then(function (response){
        return response.data.histories
    }, (error) => { console.log(error); })

    const todayCovid = covid[covid.length - 1]

    const todayVac =  vac[vac.length - 1]

    let districtObject = {
        delta_covid: todayCovid.delta[`${name}`],
        summary_covid: todayCovid.summary[`${name}`],
        delta_vac: todayVac.delta[`${name}`],
        summary_vac: todayVac.summary[`${name}`],
    }

    return districtObject

}

export default getDistrictStats 