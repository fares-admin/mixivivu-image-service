import mongoose from 'mongoose'

export class Image {
  _id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId()

  belongIds: mongoose.Types.ObjectId[] = []

  name: string = ''
}

export const ImageSchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  belongIds: Array<mongoose.Types.ObjectId>,
  name: String,
})
