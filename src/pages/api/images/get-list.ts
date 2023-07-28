import { ImageService } from '@/src/service/image-service/image-service'
import { wrapperEndpoint } from 'common-abstract-fares-system'
import { NextApiRequest, NextApiResponse } from 'next'

/*
    @ericchen:

    put your explanation here
*/

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const service = new ImageService()
  const result = await wrapperEndpoint(req, 'GET', service.getListImage(req))
  res.status(200).json(result)
}
