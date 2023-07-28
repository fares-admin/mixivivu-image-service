import axios from 'axios'
import { CommonResponse, generateServiceToken } from 'common-abstract-fares-system'
import mongoose from 'mongoose'

export enum TypeCode {
  FORGOT = 'forgot',
  LOGIN = 'login',
}

export interface ICode {
  code: string
  expired: Date
  type: TypeCode
}

export interface TInternalUserEntity {
  _id: mongoose.Types.ObjectId
  name: string
  username: string
  password: string
  email: string
  phone: string
  created: Date
  modified: Date
  token: string
  codes: ICode[]
  twoFactor: boolean
  verify: boolean
  active: boolean
}

export const authUserTokenFunc = async (
  token: string
): Promise<CommonResponse<TInternalUserEntity | string>> => {
  const internalToken = generateServiceToken({ serviceName: process.env.SERVICE_NAME || '' })
  const callInternalUser = await axios.get(
    `${process.env.INTERNAL_USER_SERVICE_URL}/api/service/verify-internal-user-token?UserToken=${token}&ServiceToken=${internalToken}`
  )
  if (callInternalUser.status !== 200)
    return {
      status: 500,
      message: 'server error',
      result: '',
      success: false,
    }
  const result = callInternalUser.data as CommonResponse<TInternalUserEntity | string>
  return result
}
