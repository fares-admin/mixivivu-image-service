import { ImageService } from '@/src/service/image-service/image-service'
import { InternalAuthService } from '@/src/service/internal-auth-service/internal-auth-service'
import { wrapperEndpoint } from 'common-abstract-fares-system'
import { NextApiRequest, NextApiResponse } from 'next'

/*
    @ericchen:

    put your explanation here
*/

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const service = new ImageService()
  const internalService = new InternalAuthService()
  const authResult = await internalService.authUserToken(req.headers.authorization || '')
  if (!authResult.success) {
    res.status(200).json(authResult)
  }
  const result = await wrapperEndpoint(req, 'DELETE', service.deleteImage(req.query.ids as string))
  res.status(200).json(result)
}
