process.env.NTBA_FIX_319 = 'test';
import bot from '../lib/components/botObject'
import connectMongo from '../lib/components/connectMongo'
import { getDistrictID } from '../lib/components/DistrictList'
import { notifyCenters, deletePrevData }  from "../lib/components/notifyCenters"
import { sendStatsAll, sendStatsId } from '../lib/components/sendStats'
import cron from 'node-cron'
import Chats from '../models/chats'
import dotenv from 'dotenv'

dotenv.config()


connectMongo()

// FUCK

async function addUserId(distId, Id) 
{
    if(await Chats.exists({ chats: Id }))
    {
        return false
    }
    
    else if (await Chats.exists({ district: distId })) 
    {    
        await Chats.updateOne({district: distId }, { $push: { chats:  Id  }})
        return true
    }

    else  
    {
        const district = new Chats({ district: distId }) 
        district.chats.push(Id)
        district.save()
        return true 
    }
}

async function removeUserId(Id) 
{
    await Chats.updateMany({ }, { $pull: { chats:  Id  }})
}

bot.onText(/\/start/, (msg) => {

    var sendOpts = {
        parse_mode : "MarkdownV2",
        };
    
    const startMessage =

`
⭕ To get notifed of vaccines when they become available and updates on daily statistics and hyperlocal news 
/subscribe to updates

🛑 To stop recieving them /unsubscribe from updates

📊 Use /stats to get latest statistics for a district

✅ Use /start to view this message again
`

    bot.sendMessage(
        msg.chat.id,
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

    const getDistritMessage = 
        
`🏠 Please select a district from the keyboard below`


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
            
            if (districtId != 0) {
                if (await addUserId(districtId, chatId) ) {
                bot.sendMessage(
                chatId,
`✅ You've been subscribed to updates from ${match[0]} District

You'll be notified within 5 minutes of vaccine data being updated and as soon as new statistics become available

News will be coming soon and you can 
/unsubscribe anytime`,
                removeKeyboard
            )}

            else {
                bot.sendMessage(
                chatId,
                `🚨 There's been an issue with your request. Have you already subscribed to a district? Try /unsubscribe`,
                removeKeyboard
                )}
            }

                bot.removeTextListener(/.+/g)
        });
    })

bot.onText(/\/stats/, (msg) => {
    
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

    const getDistritMessage = 
        
`🏠 Please select a district from the keyboard below`


    bot.sendMessage(
        chatId,
        getDistritMessage, 
        sendOpts,
    )

    bot.onText(/.+/g, async function (message, match) {

            const removeKeyboard = {
                parse_mode : "Markdown",
                "reply_markup": {
                    "remove_keyboard": true
                }
            }

            var districtId = await getDistrictID(match[0])     
            
            if (districtId != 0) {
                await sendStatsId(chatId, districtId)
            }

            else {
                bot.sendMessage(
                chatId,
                `🚨 There's been an issue with your request. Try again.`,
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
        `🛑 You've been unsubscibed from all updates`,
    )
            
})

bot.on('polling_error', (error) => {

    console.log(error);

});

cron.schedule('*/5 * * * *', async () => {
    await notifyCenters()
    messageAdmin("notifyCenters Triggered")
})

cron.schedule('* */6 * * *', async () => {
    await deletePrevData()
    messageAdmin("deletePrevData Triggered")
})

messageAdmin("FUCK")

function messageAdmin(message) {

    let chatId = process.env.ADMIN_ID
    bot.sendMessage(
        chatId,
        message,
    )
}