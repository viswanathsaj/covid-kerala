import Chats from "../../models/chats"
import bot from './botObject'
import getDistrictStats from "../api/getDistrictStats"
import emoji from 'node-emoji'

let sendOpts = {
    parse_mode : "Markdown",
    };

function createMessage(stats) {

    const todayVid = stats.delta_covid
    const totalVid = stats.summary_covid
    
    const todayVac = stats.delta_vac
    const totalVac = stats.summary_vac
    
    const Message = emoji.emojify(

`
📊 *Latest Statistics* 

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
Vaccinated: ${totalVac.second_dose}

`
    )

    return Message
}

async function sendStatsAll() {
    
    const districtList = await Chats.find({})
    
    const messageObject = await districtList.map(async (obj) => {
        //Get center details for district from previous update - centersPrev

        const stats = await getDistrictStats(obj.district)        
        
        const messages = []
        const distMessage = createMessage(stats)

        const districtData = {
            message: "",
            chats: []
          };
    
        districtData.message = distMessage
        districtData.chats = obj.chats

        messages.push(districtData)
        
        return messages

    })


    const Data =  await Promise.all(messageObject).then((values) => {
    return values;
    })

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

async function sendStatsId(Id, district) {

    const removeKeyboard = {
                parse_mode : "Markdown",
                "reply_markup": {
                    "remove_keyboard": true
                }
            }
    
    
    let stats = await getDistrictStats(district)
    let message = await createMessage(stats)

    bot.sendMessage(
        Id,
        message, 
        removeKeyboard,
    )

}


export { sendStatsAll, sendStatsId } 