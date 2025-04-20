import mongoose from "mongoose";

const tagEnum = [
    "funny", "angry", "happy", "sad", "cat", "dog",
    "reaction", "emoji", "meme", "cute", "love", "laugh",
    "clap", "facepalm", "cool", "confused", "celebration", "prabhu", "dharm", "god", "devi", "matarani", "shiv", "ram", "krishna", "shyam", "hari", "narayan", "sitaram", "om", "sanatan", "satsanatandharm",
    "bhagwan", "durga", "jagdamba", "jagajjanni", "jagannath"
];

const mediaSchema = new mongoose.Schema({
    url: {
        type: String,
        required: [true, "Image url is required"]
    },
    type: {
        type: String,
        required: [true, "Image type is required"],
        enum: ["gif", "sticker"]
    },
    filename: {
        type: String,
        required: [true, "Image filename is required"]
    },
    tags: {
        type: [String],
        required: [true, "Image tags are required"],
        enum: tagEnum
    }
}, { timestamps: true });

mediaSchema.index({ filename: "text", tags: "text" });

export const MediaModel = mongoose.model("Media", mediaSchema);