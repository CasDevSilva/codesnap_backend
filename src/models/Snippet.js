import mongoose from "mongoose";

const Snippet = new mongoose.Schema({
    snippetId  : {
        type: String,
        default: "",
        required: true,
        unique: true
    },
    code       : {
        type: String,
        default: "",
        required: true,
        maxlength: 7500
    },
    language   : {type: String,  default: ""},
    theme      : {type: String,  default: ""},
    font       : {type: String,  default: ""},
    padding    : {type: Number,  default: 0},
    background : {type: String,  default: ""},
    shadow     : {type: Boolean, default: false},
    imageBase64: {
        type: String,
        required: true
    },
    shareUrl: {type: String,  default: ""},
    imageUrl: {type: String,  default: ""},
    createdAt  : {
        type: Date,
        default: Date.now,
        required: true,
        expires: 3600
    }
})

export const SnippetModel = mongoose.model("Snippet", Snippet, "snippets");