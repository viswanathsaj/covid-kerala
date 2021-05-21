process.env.NTBA_FIX_319 = 'test';
import bot from '../lib/components/botObject'
import connectMongo from '../lib/components/connectMongo'
import { getDistrictID } from '../lib/components/DistrictList'
import { notifyCenters, deletePrevData }  from "../lib/components/notifyCenters"
import { sendStats } from '../lib/components/sendStats'
import cron from 'node-cron'
import Chats from '../models/chats'
import emoji from 'node-emoji'

connectMongo()

async function addUserId(distId, Id) {
    if(await Chats.exists({ chats: Id })){
        return false
    }
    
    else if (await Chats.exists({ district: distId })) {
        
        await Chats.updateOne({district: distId }, { $push: { chats:  Id  }})
        return true
    }

    else  {
        const district = new Chats({ district: distId }) 
        district.chats.push(Id)
        district.save()
        return true 
    }
}

async function removeUserId(Id) {

await Chats.updateMany({ }, { $pull: { chats:  Id  }})

}

bot.onText(/\/start/, (msg) => {

    var sendOpts = {
        parse_mode : "MarkdownV2",
        };
    
    const startMessage = emoji.emojify(

        `*COVID Kerala* \n\n/subscribe \n/unsubscribe`
        
        )


    const chatId = msg.chat.id;
    console.log(chatId)
    bot.sendMessage(
        chatId,
        startMessage, 
        sendOpts
    )
})

bot.onText(/\/subscribe/, (msg) => {
    
    const chatId = msg.chat.id;
    
    const sendOpts = {
        parse_mode : "Markdown",
        reply_markup: JSON.stringify(
            {
                "keyboard": [
                    ['Alapuzha', 'Ernakulam', 'Idukki'],
                    ['Kannur', 'Kasargod', 'Kollam'],
                    ['Kottayam', 'Kozhikode', 'Malappuram'],
                    ['Palakkad', 'Thrissur', 'Wayanad'],
                    ['Pathanamthitta', 'Thiruvanathapuram'],
                ],
                "one_time_keyboard": true,
            }
        )};

    const getDistritMessage = emoji.emojify(
        
        'Please select your district. :heart:'
        
        )

    bot.sendMessage(
        chatId,
        getDistritMessage, 
        sendOpts,
    )

    bot.onText(/.+/g, async function (message, match) {

            const removeKeyboard = {
                "reply_markup": {
                    "remove_keyboard": true
                }
            }

            var districtId = await getDistrictID(match[0])     

            if (await addUserId(districtId, chatId)) {
                bot.sendMessage(
                chatId,
                emoji.emojify(

                    `You've been subscribed to updates from ${match[0]} District`
                    
                    ),
                removeKeyboard
            )}

            else {
                bot.sendMessage(
                chatId,
                emoji.emojify(
                    
                    `There's been an issue with your request. Have you already subscribed to a district?`
                    
                    ),
                removeKeyboard
                )}

                bot.removeTextListener(/.+/g)
        });
    })

bot.onText(/\/unsubscribe/, (msg) => {
    const chatId = msg.chat.id;
    
    removeUserId(chatId)

    bot.sendMessage(
        chatId,
        emoji.emojify(

            `You've been unsubscibed from all updates.`
            
            ),
    )
})

sendStats()

bot.on('polling_error', (error) => {

    console.log(error);

});

cron.schedule('*/5 * * * *', async () => {
    await notifyCenters()
})

cron.schedule('* */6 * * *', async () => {
    await deletePrevData()
    await sendStats()
})