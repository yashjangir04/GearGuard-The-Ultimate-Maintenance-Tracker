const mongoose = require("mongoose");

const maintenanceRequestSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },

    requestType: {
      type: String,
      enum: ["Corrective", "Preventive"],
      required: true,
    },

    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },

    equipmentCategory: {
      type: String,
      required: true,
      trim: true,
    },

    maintenanceTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    stage: {
      type: String,
      enum: ["New", "In Progress", "Repaired", "Scrap"],
      default: "New",
    },

    scheduledDate: {
      type: Date,
      default: null,
    },

    durationHours: {
      type: Number,
      default: 0,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const MaintenanceRequest = mongoose.model( "MaintenanceRequest", maintenanceRequestSchema);

module.exports = MaintenanceRequest;
