import { ApiMiddleware } from "@/assets/ts";
import dbConnect from "@/database/dbConnect";
import Log from "@/database/models/log.schema";
import { ExtendedResponse, Log as LogProps } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<LogProps[]> | Response>
) {
  await dbConnect();

  const { method } = req;

  if (method == "GET")
    return await Log.find()
      .then((e) => {
        return res.json({
          code: 200,
          success: true,
          message: "Successfully Fetched log",
          data: e,
        });
      })
      .catch((e) => {
        console.log(e);
        return res.json({
          code: 500,
          success: false,
          message: "There is an error in the Server.",
        });
      });
  else {
    return await Log.create(req.body).then((e) =>
      res.json({
        code: 200,
        success: true,
        message: "Successfully added new log",
      })
    );
  }
}

export default ApiMiddleware(handler);
