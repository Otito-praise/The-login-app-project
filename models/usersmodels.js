const { kMaxLength } = require("buffer");
const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: {
      type: String,
      reqiured: [true, "name is required"],
      trim: true,
      minlenght: ["name must have atleast 3 characters"],
      maxlength: [100, " must have atleast 3 characters"],
    },

    email: {
      type: String,
      reqiured: [true, "email is required"],
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      reqiured: [true, "email is required"],
      minlenght: ["password must have atleast 3 characters"],
    },

    image: {
      type: String,
      reqiured: [true, "image is required"],
    },
    isAdmin: {
      type: Number,
      reqiured: [true, "isAdmin is required"], //if value = 0 is not admin $ if 1 is admin
    },
    isVerify: {
      type: Number,
      default: 0, //0 is user is not verified: send email->click on email ->1:then user will be verified
    },
    token: {
      type: String,
      default: "",
    },
    resetLink: {
      data: String,
      default: "",
    },
  },
  { timestamps: true }
);

exports.User = model("Users", userSchema);
