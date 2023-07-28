import { CommonRepository } from 'common-abstract-fares-system'
import { Image, ImageSchema } from './image-entity'

export class ImageRepository extends CommonRepository<Image> {
  constructor() {
    super(ImageSchema, 'images')
  }
}
