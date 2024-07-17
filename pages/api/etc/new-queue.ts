import dbConnect from "@/database/dbConnect";
import Settings from "@/database/models/settings.schema";
import Request from "@/database/models/request.schema";
import { Response } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  await dbConnect();

  const { method } = req;

  if (method != "POST")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  try {
    let { branchId, request } = req.body;
    return await Settings.findOneAndUpdate(
      { "queue.id": branchId },
      { $inc: { "queue.$.queue": 1 } }
    ).then(async () => {
      if (request) {
        await Request.create({
          type: "queue",
          ...request,
        });
      }
      return res.json({
        success: true,
        code: 200,
      });
    });
  } catch (e) {
    console.log(e);
    return res.json({
      success: false,
      code: 500,
      message: "Error in the Server",
    });
  }
}

export default handler;
