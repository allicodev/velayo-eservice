import { ApiMiddleware } from "@/assets/ts";
import dbConnect from "@/database/dbConnect";
import Portal from "@/database/models/portal.schema";
import Log from "@/database/models/log.schema";
import { ExtendedResponse } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<any>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    return res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  const { _id } = req.query;

  try {
    return await Portal.findOneAndRemove({ _id }).then(async (e) => {
      await Log.deleteMany({ portalId: _id, type: "portal" });

      return res.json({
        code: 200,
        success: true,
        message: "Successfully Deleted",
      });
    });
  } catch (e) {
    console.log(e);
    return res.json({
      code: 500,
      success: false,
      message: "There is an error in the Server.",
    });
  }
}

export default ApiMiddleware(handler);
