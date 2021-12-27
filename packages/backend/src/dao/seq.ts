import { model, Schema } from 'mongoose'

export const SeqModel = model('Seq', new Schema({
  collectionName: {
    type: String,
    unique: true,
    required: true
  },
  initIndent: {
    type: Number,
    default: 0
  },
  seq: {
    type: Number,
    required: true
  }
}))
