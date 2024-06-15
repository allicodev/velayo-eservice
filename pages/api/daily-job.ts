import dbConnect from "@/database/dbConnect";
import Log from "@/database/models/log.schema";
import { ExtendedResponse, Response } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<Response>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  return await Log.find(
    {
      type: "attendance",
      $or: [
        { timeIn: { $gte: Date.now() / 1000 - 15 * 24 * 60 * 60 } },
        { timeOut: { $gte: Date.now() / 1000 - 15 * 24 * 60 * 60 } },
      ],
    },
    { _id: 1 }
  )
    .select("_id")
    .then(async (e) => {
      await Log.updateMany(
        { _id: { $in: e.map((_) => _._id.toString()) } },
        { timeInPhoto: null, timeOutPhoto: null }
      );

      return res.json({
        code: 200,
        success: true,
        message: "Successfully Fetched branches",
        data: e as any,
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
}

export default handler;
