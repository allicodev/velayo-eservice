import { verify } from "./jwt_jose";

import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const JWT_SECRET = process.env.JWT_PRIVATE_KEY ?? "";

interface RequestWithAuthData extends NextApiRequest {
  auth_data: {
    id: number;
    email: string;
  };
}

const authMiddleware = (handler: NextApiHandler) => {
  return async (req: RequestWithAuthData, res: NextApiResponse) => {
    try {
      const authorizationToken = req.headers.authorization;

      if (authorizationToken) {
        const data = (await verify(
          authorizationToken.split(" ")[1],
          JWT_SECRET
        )) as {
          id: number;
          email: string;
        };

        req.auth_data = data;

        return handler(req, res);
      } else {
        res
          .status(401)
          .json({ error: "Unauthorized", message: "Not allowed." });
      }
    } catch (error) {
      res.status(401).json({ error: "Unauthorized", message: "Not allowed." });
    }
  };
};

export default authMiddleware;
