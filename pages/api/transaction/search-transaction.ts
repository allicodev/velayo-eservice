import authMiddleware from "@/assets/ts/apiMiddleware";
import dbConnect from "@/database/dbConnect";
import Transaction from "@/database/models/transaction.schema";
import { ExtendedResponse, Transaction as TransactionProp } from "@/types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import type { NextApiRequest, NextApiResponse } from "next";

dayjs.extend(timezone);
dayjs.extend(utc);

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<TransactionProp>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  return await Transaction.findOne({
    $and: [
      {
        ...req.query,
        ...(req.query.status
          ? {
              $expr: {
                $in: [
                  { $arrayElemAt: ["$history.status", -1] },
                  [req.query.status],
                ],
              },
            }
          : {}),
      },
      {
        $gte: dayjs().tz("Asia/Manila").startOf("day").toDate(),
      },
      {
        $kte: dayjs().tz("Asia/Manila").endOf("day").toDate(),
      },
    ],
  })
    .then(async (e) => {
      return res.json({
        code: 200,
        success: true,
        message: "Found a Transaction!",
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
}

export default authMiddleware(handler);
