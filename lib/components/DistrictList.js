var Data = [
    {
        "district_id": 301,
        "district_name": "Alappuzha"
    },
    {
        "district_id": 307,
        "district_name": "Ernakulam"
    },
    {
        "district_id": 306,
        "district_name": "Idukki"
    },
    {
        "district_id": 297,
        "district_name": "Kannur"
    },
    {
        "district_id": 295,
        "district_name": "Kasaragod"
    },
    {
        "district_id": 298,
        "district_name": "Kollam"
    },
    {
        "district_id": 304,
        "district_name": "Kottayam"
    },
    {
        "district_id": 305,
        "district_name": "Kozhikode"
    },
    {
        "district_id": 302,
        "district_name": "Malappuram"
    },
    {
        "district_id": 308,
        "district_name": "Palakkad"
    },
    {
        "district_id": 300,
        "district_name": "Pathanamthitta"
    },
    {
        "district_id": 296,
        "district_name": "Thiruvananthapuram"
    },
    {
        "district_id": 303,
        "district_name": "Thrissur"
    },
    {
        "district_id": 299,
        "district_name": "Wayanad"
    }
]
    

const getDistrictID  =  (query) => {

    var Id = 0

    Data.map((dist) => {
        if (dist.district_name == query) {
            Id = dist.district_id
        }
    })

    return Id
}

const getDistrictName  = (query) => {

    var district = Data.filter(district => {
        return district.district_id === query;
        })
    return district[0].district_name

}

export { getDistrictID, getDistrictName } 