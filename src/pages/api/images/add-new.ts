import { NextApiRequest, NextApiResponse } from 'next'

import { ImageService } from '@/src/service/image-service/image-service'
import { InternalAuthService } from '@/src/service/internal-auth-service/internal-auth-service'
import { wrapperEndpoint } from 'common-abstract-fares-system'

/*
    @ericchen:

    put your explanation here
*/

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const internalService = new InternalAuthService()
  const authResult = await internalService.authUserToken(req.headers.authorization || '')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader(
    'Access-Control-Allow-Origin',
    req.headers.host?.includes('localhost')
      ? `http://${req.headers.host}`
      : `https://${req.headers.host}`
  ) // replace this your actual origin
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  if (!authResult.success) {
    res.status(200).json(authResult)
  } else {
    const service = new ImageService()
    const result = await wrapperEndpoint(req, 'POST', service.addNewImage(req))
    res.status(200).json(result)
  }
}
