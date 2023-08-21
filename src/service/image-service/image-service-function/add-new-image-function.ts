import * as Minio from 'minio'

import formidable, { IncomingForm } from 'formidable'

import { Image } from '@/src/repository/image-repository/image-entity'
import { ImageRepository } from '@/src/repository/image-repository/image-repository'
import { CommonResponse } from 'common-abstract-fares-system'
import logger from 'common-abstract-fares-system/lib/logger'
import mongoose from 'mongoose'
import { NextApiRequest } from 'next'

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
  if (data?.files?.file.length === 0) {
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
      (id) => id.length > 0 && mongoose.isValidObjectId(id)
    ).length === 0
  ) {
    return {
      status: 400,
      message: 'belongId required',
      result: '',
      success: false,
    }
  }
  const imagesList = data.files.file.filter((item) => !!item.filepath)
  const insertList = await Promise.all(
    imagesList.map(async (item) => {
      if (!/^[A-Za-z0-9-]*$/.test(String(item.originalFilename).split('.')[0])) {
        return 'Name contain special characters'
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
          return 'not found bucket'
        }
      } catch (err) {
        logger.info(['Bucket', String(process.env.MINIO_BUCKET)])
        logger.error([err as string])
        return String(err)
      }
      try {
        const uploadObject = await minioClient.fPutObject(
          String(process.env.MINIO_BUCKET),
          String(item.originalFilename),
          String(item.filepath)
        )
        if (uploadObject.etag) {
          const entity: Image = {
            ...new Image(),
            name: String(item.originalFilename),
            belongIds: Array(String(data?.fields?.belongId))
              .filter((item) => item.length > 0 && mongoose.isValidObjectId(item))
              .map((item) => new mongoose.Types.ObjectId(item)),
          }
          const { error } = await repository.insert([{ ...entity }])
          if (error) {
            return error
          }
        }
      } catch (err) {
        logger.info(['Bucket', String(process.env.MINIO_BUCKET)])
        logger.error([err as string])
        return String(err)
      }
      return 'ok'
    })
  )
  return {
    status: 200,
    message: 'ok',
    result: insertList.join(','),
    success: true,
  }
}
