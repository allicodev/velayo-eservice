import { ApiMiddleware } from "@/assets/ts";
import dbConnect from "@/database/dbConnect";
import Notification from "@/database/models/notification.schema";
import { Response } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  return await Notification.findOneAndUpdate(
    { _id: req.query._id },
    { $set: { isRead: true } }
  )
    .then((e) => res.json({ success: true, code: 200 }))
    .catch((e) => {
      console.log(e);
      return res.json({
        success: false,
        code: 500,
        message: "Error in the Server",
      });
    });
}

export default ApiMiddleware(handler);
