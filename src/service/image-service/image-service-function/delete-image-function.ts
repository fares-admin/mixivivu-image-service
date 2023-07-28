import { ImageRepository } from '@/src/repository/image-repository/image-repository'
import { CommonResponse } from 'common-abstract-fares-system'
import logger from 'common-abstract-fares-system/lib/logger'
import * as Minio from 'minio'
import mongoose from 'mongoose'

export const deleteImageFunc = async (
  ids: string,
  repository: ImageRepository
): Promise<CommonResponse<string>> => {
  const invalidParamRes = {
    success: false,
    message: 'invalid params',
    result: '',
    status: 400,
  }
  if (!ids) {
    return invalidParamRes
  }
  const listId = ids.split(',')
  const filteredIds = listId.filter((item) => {
    if (!mongoose.isValidObjectId(item)) {
      return false
    }
    return true
  })
  if (filteredIds.length === 0) {
    return invalidParamRes
  }
  const minioClient = new Minio.Client({
    endPoint: String(process.env.MINIO_ENDPOINT),
    port: Number(process.env.MINIO_PORT),
    useSSL: Boolean(process.env.MINIO_SSL),
    accessKey: String(process.env.MINIO_ACCESSKEY),
    secretKey: String(process.env.MINIO_SECRETKEY),
  })
  try {
    const messErrBucket = await minioClient.bucketExists(String(process.env.MINIO_BUCKET))
    if (!messErrBucket) {
      return {
        status: 500,
        message: 'not found bucket',
        result: '',
        success: false,
      }
    }
  } catch (err) {
    logger.info(['Bucket', String(process.env.MINIO_BUCKET)])
    logger.error([err as string])
    return {
      status: 500,
      message: String(err),
      result: '',
      success: false,
    }
  }
  const deleteIds = await Promise.all(
    filteredIds.map(async (item) => {
      const objectFind = await repository.findOne('_id', new mongoose.Types.ObjectId(item))
      if (objectFind.result) {
        try {
          await minioClient.removeObject(String(process.env.MINIO_BUCKET), objectFind.result.name)
          return item
        } catch (err) {
          logger.error([err as string])
        }
      }
      return ''
    })
  )
  const { error } = await repository.delete(deleteIds.filter((item) => item.length > 0))
  if (error) {
    return {
      status: 500,
      message: error || '',
      result: '',
      success: false,
    }
  }
  return {
    status: 200,
    message: 'ok',
    result: '',
    success: true,
  }
}
