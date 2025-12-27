const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phoneNo: {
      type: String,
      required: true,
      length: 10,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["Manager", "Technician", "Employee"],
      required: true,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    company: {
      type: String,
      trim: true,
      default: null,
    },

    department: {
      type: String,
      trim: true,
      default: null,
    },

    maintenanceTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },

    assignedRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MaintenanceRequest",
      },
    ],

    ownedEquipment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Equipment",
      },
    ],

    managedTeams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],

    availableHours: {
      type: Number,
      default: 8,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", employeeSchema);
module.exports = User;
