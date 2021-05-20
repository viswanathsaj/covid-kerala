process.env.NTBA_FIX_319 = 'test';
import TelegramBot from 'node-telegram-bot-api'
import getDistrictID from '../lib/components/DistrictList'
import { checkCenters, deletePrevData }  from "../lib/components/checkCenters"
import cron from 'node-cron'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Chats from '../models/chats'

dotenv.config()

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {polling: true});

async function connect() {
    await mongoose.connect(
        "mongodb://mongodb:27017/kerala-covid",
        {
            useUnifiedTopology: true,
            useNewUrlParser: true
        }
);
console.log("Connected")
}

connect()

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

    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        '*COVID Helper India* \n\n/subscribe \n/unsubscribe ', sendOpts
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
                    ['Palakkad', 'Pathanamthitta', 'Thiruvanathapuram'],
                    ['Thrissur', 'Wayanad'],
                ],
                "one_time_keyboard": true,
            }
        )};
    
    const removeKeyboard = {
        "reply_markup": {
            "remove_keyboard": true
        }
      }

    const districtMessage = `Please select your district.`

    bot.sendMessage(
        chatId,
        districtMessage, 
        sendOpts,
    )

    bot.onText(/.+/g, async function (message, match) {

            var districtId = await getDistrictID(match[0])     

            if (await addUserId(districtId, chatId)) {
                bot.sendMessage(
                chatId,
                `You've been subscribed to updates from ${match[0]} district`,
                removeKeyboard
            )}

            else {
                bot.sendMessage(
                chatId,
                `There's been an issue with your request. Have you already subscribed to a district?`,
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
        `You've been unsubscibed from all updates.`,
    )
})

bot.on('polling_error', (error) => {

    console.log(error);

});

cron.schedule('*/5 * * * *', async () => {
    
    let sendOpts = {
        parse_mode : "MarkdownV2",
        };
    
    let Data = []
    Data = await checkCenters()

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
})

cron.schedule('* */6 * * *', async () => {
    await deletePrevData()
})