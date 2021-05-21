import mongoose from 'mongoose'


async function connectMongo() {
    await mongoose.connect(
        "mongodb://mongodb:27017/kerala-covid",
        {
            useUnifiedTopology: true,
            useNewUrlParser: true
        }
);
console.log("Connected")
}

export default connectMongo