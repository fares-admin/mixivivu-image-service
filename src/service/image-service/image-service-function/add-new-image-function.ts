import { ImageRepository } from '@/src/repository/image-repository/image-repository'
import { CommonResponse } from 'common-abstract-fares-system'
import formidable, { IncomingForm } from 'formidable'
import { NextApiRequest } from 'next'

import { Image } from '@/src/repository/image-repository/image-entity'
import logger from 'common-abstract-fares-system/lib/logger'
import * as Minio from 'minio'
import mongoose from 'mongoose'

/*
      @ericchen:
  
      put your explanation here
  */

export const addNewImageFunc = async (
  req: NextApiRequest,
  repository: ImageRepository
): Promise<CommonResponse<string>> => {
  const data = (await new Promise((resolve, reject) => {
    const form = new IncomingForm()

    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      return resolve({ fields, files: files as any })
    })
  })) as {
    fields: formidable.Fields
    files: {
      file: formidable.Files[]
    }
  }
  if (!data?.files?.file[0].filepath) {
    return {
      status: 400,
      message: 'not found file',
      result: '',
      success: false,
    }
  }
  if (!data?.fields?.belongId?.length) {
    return {
      status: 400,
      message: 'belongId required',
      result: '',
      success: false,
    }
  }
  if (
    Array(String(data?.fields?.belongId)).filter(
      (item) => item.length > 0 && mongoose.isValidObjectId(item)
    ).length === 0
  ) {
    return {
      status: 400,
      message: 'belongId required',
      result: '',
      success: false,
    }
  }
  if (!/^[A-Za-z0-9-]*$/.test(String(data.files.file[0].originalFilename).split('.')[0])) {
    return {
      status: 400,
      message: 'name file include special characters',
      result: '',
      success: false,
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
  try {
    const uploadObject = await minioClient.fPutObject(
      String(process.env.MINIO_BUCKET),
      String(data.files.file[0].originalFilename),
      String(data?.files?.file[0].filepath)
    )
    if (uploadObject.etag) {
      const entity: Image = {
        ...new Image(),
        name: String(data.files.file[0].originalFilename),
        belongIds: Array(String(data?.fields?.belongId))
          .filter((item) => item.length > 0 && mongoose.isValidObjectId(item))
          .map((item) => new mongoose.Types.ObjectId(item)),
      }
      const { error } = await repository.insert([{ ...entity }])
      if (error) {
        return {
          status: 500,
          message: error || '',
          result: '',
          success: false,
        }
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
  return {
    status: 200,
    message: 'ok',
    result: '',
    success: true,
  }
}
