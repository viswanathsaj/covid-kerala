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

export default async function getDistrictStats(query) {

    const name = getDistrictName(query)
    
    const Data = await api.get('/histories.json').then(function (response){
        return response.data.histories
    }, (error) => { console.log(error); })

    const date = todayDate()

    const todayData = Data.filter(today => {
        return today.date == date;
    })

    let districtObject = {
        delta: todayData[0].delta[`${name}`],
        summary: todayData[0].summary[`${name}`]
    }

    return districtObject

}