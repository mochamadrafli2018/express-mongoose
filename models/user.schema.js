const mongoose = require("mongoose");

module.exports = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      name : {
        type: String,
        default: null,
        required:true,
        },
      email : { 
        type: String, 
        unique: true,
        lowercase: true,
        trim: true,
        required:true,
      },
      gender : { 
        type: String, 
        default: null,
        required:true,
      },
      password : { 
        type: String,
        default: null,
        required:true,
      },
      role: {
        type: String,
        enum: ["member", "admin"],
        required: true,
      },
      updatedScreeningResult : { 
        type: String,
        default: null,
      },
    },
    { 
      timestamps: true 
    },
  ),
  // collection
  'users',
);