import { CommonResponse } from 'common-abstract-fares-system'
import { TInternalUserEntity, authUserTokenFunc } from './internal-auth-function/auth-user-token'

export class InternalAuthService {
  public async authUserToken(token: string): Promise<CommonResponse<TInternalUserEntity | string>> {
    return await authUserTokenFunc(token)
  }
}
