import axios from "axios"

const api = axios.create({
  baseURL: `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict`,
})


export default async function getDataByDistict(DistrictId, queryDate) {
  
  const data = await api.get('/',{ headers: { 'User-Agent': 'Mozilla/5.0' },params : {
    district_id : DistrictId,
    date: queryDate,
}}).then(function (response){
      return response.data.centers;
  }, (error) => { console.log(error); })

return data
}