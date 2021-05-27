import getDataByDistict from "../api/getCentersByDistrict"
import Chats from "../../models/chats"
import PrevCenters from "../../models/centers"
import bot from './botObject'

function tomorrowDate() {
    const today = new Date()
    var format = 'dd-mm-yy'
    var date = format.replace('dd', today.getDate() + 1)
    .replace('mm', ("0" + (today.getMonth() + 1)).slice(-2))
    .replace('yy', today.getFullYear().toString().slice(-2))

    return date
}

function sendtoPrev(Id, centerData) {

    if (PrevCenters.exists({ district: Id })) {
        
        centerData.map(async (data) => {
        await PrevCenters.updateOne({ district: Id }, { $push: { data: data } })
    
    })}

    else  {
        const district = new PrevCenters({ district: Id }) 
        centerData.map(async (data) => {
            district.data.push(data)})
        district.save()
    }
    
    
    
    centerData.map(async (data) => {
        await PrevCenters.updateOne({ district: Id }, { $push: { data: data } })
    })

}

async function deletePrevData() {
    await PrevCenters.updateMany({}, { $set : {data: [] }})
}

async function getfromPrev(Id) {
    const [raw_data] = await PrevCenters.find({district: Id})

    return raw_data.data;
}

function totalCap(sessions)  {
                    
                    let total = 0;
                    
                    sessions.map((session) => {
                        total = total + session.available_capacity
                    })
                    return total;
                }

function containsObject(list, obj) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].center_id == obj.center_id) {
            return true;
        }
    }

    return false;
}

function createMessageObject(availCenters, obj) {

    let Message = `*Vaccines are now available in the following centers*`
        
        availCenters.map((center) => {

            const Center = 
            
`

*${center.name}*
Minimum Age: ${center.session[0].min_age_limi}
Vaccine: ${center.session[0].vaccine}
Available Capacity: ${center.session[0].available_capacity}

`

        Message = Message + Center

        })

        
        const districtData = {
            message: "",
            chats: []
          };

        districtData.message = Message
        districtData.chats = obj.chats

        sendtoPrev(obj.district, availCenters)

        return districtData
}

async function notifyCenters() {
    
    const districtList = await Chats.find({})
    
const messageObject = await districtList.map(async (obj) => {
        //Get center details for district from previous update - centersPrev

        const centersNow = await getDataByDistict(obj.district, tomorrowDate())        
        const centersPrev = await getfromPrev(obj.district)
                
        let availCenters = []

        if (centersPrev.length > 0) {

        centersNow.map((now) => {
            centersPrev.map((prev) => {

                const nowCap = totalCap(now.sessions)
                const prevCap = totalCap(prev.sessions)

                if (now.center_id == prev.center_id && nowCap > prevCap) {
                        availCenters.push(now)
                }
            })
        })

        }

        centersNow.map((now) => {
            const cap = totalCap(now.sessions)
            if (!containsObject(centersPrev, now) && cap > 0) {
                availCenters.push(now)
            }
        })

        let messages = 0

        if (availCenters.length > 0) {
            messages = []
            const data = createMessageObject(availCenters, obj)
            messages.push(data)
        }
        
        return messages

    })


    const Data =  await Promise.all(messageObject).then((values) => {
    return values;
    })

    let sendOpts = {
        parse_mode : "MarkdownV2",
        };

    Data.map((district) => {
        
        if(district != 0) {

            district.map((obj) => {
                const chatList = obj.chats
                chatList.map((chat) => {
                    bot.sendMessage(
                        chat,
                        obj.message, 
                        sendOpts,
                    )
                }) 
            })

        }
    })
    
}

export { notifyCenters, deletePrevData } 