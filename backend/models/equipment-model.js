const mongoose = require("mongoose");

const equipmentSchema = mongoose.Schema({
    equipmentName : {
        type : String,
        trim : true,
        required : true,
    },
    serialNumber : {
        type : Number,
        required : true,
    },
    category : {
        type : String,
        required : true,
        trim : true
    },
    assignedEmployee : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    maintenanceTeam : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Team",
        required : true
    },
    company : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Company",
        required : true
    },
    technician : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
        default : null
    },
    purchaseDate : {
        type : Date,
        required : true
    },
    warranty : {
        type : Number,
        required : true
    },
    location : {
        type : String,
        required : true,
        trim : true
    },
    isActive : {
        type : Boolean,
        required : true,
        default : true
    }
} , { timestamps : true });

const equipmentModel = mongoose.model("Equipment" , equipmentSchema);
module.exports = equipmentModel;