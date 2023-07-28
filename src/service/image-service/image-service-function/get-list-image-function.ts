import { ImageRepository } from '@/src/repository/image-repository/image-repository'
import { CommonListResult, CommonResponse } from 'common-abstract-fares-system'
import logger from 'common-abstract-fares-system/lib/logger'
import * as Minio from 'minio'
import mongoose from 'mongoose'
import { NextApiRequest } from 'next'
import { ImageRes } from '../image-res'

/*
      @ericchen:
  
      put your explanation here
  */

export const getListImageFunc = async (
  req: NextApiRequest,
  repository: ImageRepository,
  getPageAndSize: (req: {
    query: {
      page: number
      size: number
    }
  }) => {
    page: number
    size: number
  },
  pipelines: mongoose.PipelineStage[]
): Promise<CommonResponse<CommonListResult<ImageRes> | string>> => {
  const { page, size } = getPageAndSize(req as any)
  const result = await repository.find(page, size, pipelines)
  if (!result.result) {
    return {
      status: 500,
      message: 'sv error',
      success: true,
      result: '',
    }
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
  const dataResult: ImageRes[] = await Promise.all(
    result.result.data.map(async (item) => {
      try {
        const link = await minioClient.presignedUrl(
          'GET',
          String(process.env.MINIO_BUCKET),
          item.name
        )
        return {
          ...item,
          _id: item._id.toString(),
          link,
          belongIds: item.belongIds.map((item) => item.toString()),
        }
      } catch (err) {
        logger.error([err as string])
        return {
          ...item,
          _id: item._id.toString(),
          link: '',
          belongIds: item.belongIds.map((item) => item.toString()),
        }
      }
    })
  )
  return {
    status: 200,
    message: 'ok',
    success: true,
    result: {
      ...result.result,
      data: dataResult,
    },
  }
}
