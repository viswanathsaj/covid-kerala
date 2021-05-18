import mongoose from 'mongoose'

const ChatsSchema = new mongoose.Schema({
  district: {
    type: Number,
    required: true,
  },
  chats: [Number]
});

const Chats = mongoose.model("Chats", ChatsSchema);

export default Chats

