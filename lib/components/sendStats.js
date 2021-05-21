import Chats from "../../models/chats"
import bot from './botObject'
import getDistrictStats from "../api/getDistrictStats"
import emoji from 'node-emoji'

function createMessageObject(stats, obj) {

    const today = stats.delta
    const total = stats.summary
    
    const Message = emoji.emojify(

`
:heart: *Latest Statistics for your district* 

*Today*

New Cases: ${today.confirmed}
Recovered: ${today.recovered}
Deaths: ${today.deceased}


*All Time*

Total Cases: ${total.confirmed}
Currently Active: ${total.active}
Recovered: ${total.recovered}
Deaths: ${total.deceased}
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