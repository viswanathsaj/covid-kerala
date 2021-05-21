import Chats from "../../models/chats"
import bot from './botObject'
import getDistrictStats from "../api/getDistrictStats"
import emoji from 'node-emoji'

function createMessageObject(stats, obj) {

    const todayVid = stats.delta_covid
    const totalVid = stats.summary_covid
    
    const todayVac = stats.delta_vac
    const totalVac = stats.summary_vac
    
    const Message = emoji.emojify(

`
📊 *Latest Statistics For Your District* 

⏳ *Today*

New Cases: ${todayVid.confirmed}
Recovered: ${todayVid.recovered}
Deaths: ${todayVid.deceased}
Vaccinations: ${todayVac.tot_vaccinations}


🗓️ *All Time*

Total Cases: ${totalVid.confirmed}
Currently Active: ${totalVid.active}
Recovered: ${totalVid.recovered}
Deaths: ${totalVid.deceased}
Vaccinated; ${todayVac.second_dose}

`
    )

    const districtData = {
        message: "",
        chats: []
      };

    districtData.message = Message
    districtData.chats = obj.chats

    return districtData
}

async function sendStats() {
    
    const districtList = await Chats.find({})
    
    const messageObject = await districtList.map(async (obj) => {
        //Get center details for district from previous update - centersPrev

        const stats = await getDistrictStats(obj.district)        
        
        const messages = []
        const data = createMessageObject(stats, obj)
        messages.push(data)
        
        return messages

    })


    const Data =  await Promise.all(messageObject).then((values) => {
    return values;
    })

    let sendOpts = {
        parse_mode : "Markdown",
        };

    Data.map((district) => {

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
    
    })
    
}

export { sendStats } 