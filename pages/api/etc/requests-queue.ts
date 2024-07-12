import authMiddleware from "@/assets/ts/apiMiddleware";
import dbConnect from "@/database/dbConnect";
import Request from "@/database/models/request.schema";
import { ExtendedResponse, RequestQueue } from "@/types";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

import type { NextApiRequest, NextApiResponse } from "next";
import dayjs from "dayjs";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<RequestQueue[]>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  try {
    return await Request.find({
      $and: [
        {
          ...(req.query.queue
            ? {
                queue: req.query.queue,
              }
            : {}),
          branchId: req.query.branchId,
          $and: [
            {
              createdAt: {
                $gte: dayjs().tz("Asia/Manila").startOf("day").toDate(),
              },
            },
            {
              createdAt: {
                $gte: dayjs().tz("Asia/Manila").startOf("day").toDate(),
              },
            },
          ],
        },
      ],
    })
      .sort({ queue: 1 })
      .populate("transactionId branchId")
      .then((e) => res.json({ success: true, code: 200, data: e as any }));
  } catch (e) {
    console.log(e);
    return res.json({
      success: false,
      code: 500,
      message: "Error in the Server",
    });
  }
}

export default authMiddleware(handler);
