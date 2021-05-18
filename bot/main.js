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
  { useUnifiedTopology: true }
);
console.log("Connected")
}

connect()

bot.sendMessage(1620118953, "Server Started")

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
    captureDistrict(chatId, 17)

    })

 function captureDistrict(chatId, stateId) {

    const sendOpts = {
        parse_mode : "Markdown",
        reply_markup: JSON.stringify(
            {
                force_reply: true,
            }
        )};

    const districtMessage = `*Please reply with the name of your district* \n
    Alappuzha
    Ernakulam
    Idukki
    Kannur
    Kasaragod
    Kollam
    Kottayam
    Kozhikode
    Malappuram
    Palakkad
    Pathanamthitta
    Thiruvananthapuram
    Thrissur
    Wayanad`

    bot.sendMessage(
        chatId,
        districtMessage, 
        sendOpts,
    ).then(function(sended) {
        var chatId = sended.chat.id;
        var messageId = sended.message_id;
        bot.onReplyToMessage(chatId, messageId, async function (message) {
            bot.sendMessage(
                chatId,
                `District selected: ${message.text}`
            )

            var districtId = await getDistrictID(message.text, stateId)
            
            if (await addUserId(districtId, chatId)) {
                bot.sendMessage(
                chatId,
                `You've been subscribed to updates.`
            )}

            else {
                bot.sendMessage(
                chatId,
                `There's been an issue. Try again`
                )}
        });
    })
}


bot.onText(/\/unsubscribe/, (msg) => {
    const chatId = msg.chat.id;
    
    removeUserId(chatId)

    bot.sendMessage(
        chatId,
        `You've been unsubscibed from updates.`,
    )
})

bot.on('polling_error', (error) => {

    console.log(error);

});

// cron.schedule('*/30 * * * * *', async () => {

//     checkCenters()
//     console.log(run)

// })

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