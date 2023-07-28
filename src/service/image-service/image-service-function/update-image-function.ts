import { Image } from '@/src/repository/image-repository/image-entity'
import { ImageRepository } from '@/src/repository/image-repository/image-repository'
import { CommonResponse } from 'common-abstract-fares-system'
import mongoose from 'mongoose'

export const updateImageFunc = async (
  id: string,
  repo: ImageRepository,
  belongIds: string
): Promise<CommonResponse<string>> => {
  if (!id || !mongoose.isValidObjectId(id)) {
    return {
      status: 400,
      success: true,
      message: 'invalid Id',
      result: '',
    }
  }
  const findId = await repo.findOne('_id', new mongoose.Types.ObjectId(id))
  if (!findId.result) {
    return {
      success: false,
      message: 'not found image',
      result: '',
      status: 404,
    }
  }
  const entity: Image = {
    ...findId.result,
    belongIds: belongIds
      .split(',')
      .filter((item) => item.length > 0 && mongoose.isValidObjectId(item))
      .map((item) => new mongoose.Types.ObjectId(item)),
  }

  const result = await repo.update([entity])
  if (result.error) {
    return {
      status: 500,
      success: false,
      message: String(result.error),
      result: '',
    }
  }
  return {
    status: 200,
    success: true,
    message: 'success',
    result: '',
  }
}
