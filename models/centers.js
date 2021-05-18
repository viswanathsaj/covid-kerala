import mongoose from 'mongoose'

const PrevCentersSchema = new mongoose.Schema({
    district: String,
    data: {}
});

const PrevCenters = mongoose.model("PrevCenters", PrevCentersSchema);

export default PrevCenters