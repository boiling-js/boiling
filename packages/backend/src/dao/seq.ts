import { model, Schema } from 'mongoose'

export const SeqModel = model('Seq', new Schema({
  collectionName: {
    type: String,
    unique: true,
    required: true
  },
  seq: {
    type: Number,
    required: true
  }
}))
