import dbConnect from "@/database/dbConnect";
import Log from "@/database/models/log.schema";
import { queueResetter } from "@/provider/utils/queue-resetter";
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

  const currentDate: Date = new Date();
  const pastDate: Date = new Date(
    currentDate.setDate(currentDate.getDate() - 15)
  );

  await queueResetter();

  return await Log.find(
    {
      type: "attendance",
      $or: [{ timeIn: { $lte: pastDate } }, { timeOut: { $lte: pastDate } }],
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
