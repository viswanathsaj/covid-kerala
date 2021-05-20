
import axios from "axios"

const api = axios.create({
  baseURL: `https://cdn-api.co-vin.in/api/v2/admin/location/districts/`,
})


export default function getDistrictList(StateId) {
  
  const data = api.get(`/${StateId}`, { headers: { 'User-Agent': 'Mozilla/5.0' }  }).then(function (response){
    return response.data.districts;
  }, (error) => { console.log(error); })

  return data

  }
