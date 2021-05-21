import axios from "axios"
import { getDistrictName } from '../components/DistrictList'

const api = axios.create({
    baseURL: `https://keralastats.coronasafe.live`,
})

function todayDate() {
    const today = new Date()
    var format = 'dd-mm-yyyy'
    var date = format.replace('dd', today.getDate())
    .replace('mm', ("0" + (today.getMonth() + 1)).slice(-2))
    .replace('yyyy', today.getFullYear())
    
    return date
}

async function getDistrictStats(query) {

    const name = getDistrictName(query)
    
    const covid = await api.get('/histories.json').then(function (response){
        return response.data.histories
    }, (error) => { console.log(error); })

    const vac = await api.get('/vaccination_histories.json').then(function (response){
        return response.data.histories
    }, (error) => { console.log(error); })

    const date = todayDate()

    const todayCovid = covid.filter(today => {
        return today.date == date;
    })

    const todayVac = vac.filter(today => {
        return today.date == date;
    })

    let districtObject = {
        delta_covid: todayCovid[0].delta[`${name}`],
        summary_covid: todayCovid[0].summary[`${name}`],
        delta_vac: todayVac[0].delta[`${name}`],
        summary_vac: todayVac[0].summary[`${name}`],
    }

    return districtObject

}

export default getDistrictStats 