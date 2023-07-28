import { Image } from '@/src/repository/image-repository/image-entity'
import { ImageRepository } from '@/src/repository/image-repository/image-repository'
import { CommonListResult, CommonResponse, CommonService } from 'common-abstract-fares-system'
import { NextApiRequest } from 'next'
import { ImageRes } from './image-res'
import {
  addNewImageFunc,
  deleteImageFunc,
  getListImageFunc,
  updateImageFunc,
} from './image-service-function'

export class ImageService extends CommonService<ImageRepository> {
  constructor() {
    super(new ImageRepository())
  }

  public async getListImage(
    req: NextApiRequest
  ): Promise<CommonResponse<CommonListResult<ImageRes> | string>> {
    return await getListImageFunc(
      req,
      this.repository,
      this.getPageAndSize,
      this.generatePipelineAggregate(req.query, new Image())
    )
  }

  public async addNewImage(req: NextApiRequest): Promise<CommonResponse<string>> {
    return await addNewImageFunc(req, this.repository)
  }

  public async deleteImage(ids: string): Promise<CommonResponse<string>> {
    return await deleteImageFunc(ids, this.repository)
  }

  public async updateImage(id: string, belongIds: string): Promise<CommonResponse<string>> {
    return await updateImageFunc(id, this.repository, belongIds)
  }
}
