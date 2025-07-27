import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Helper function to run Express-style middleware in Next.js API routes.
 * @param req The Next.js API request object.
 * @param res The Next.js API response object.
 * @param fn The middleware function to run.
 * @returns A promise that resolves when the middleware has run.
 */
export function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}
