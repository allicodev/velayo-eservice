import dbConnect from "@/database/dbConnect";
import Transaction from "@/database/models/transaction.schema";
import { ExtendedResponse, Transaction as TransactionType } from "@/types";
import dayjs from "dayjs";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<TransactionType[]>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  let { page, pageSize, status, order, fromDate, toDate } = req.query;

  const _page = Number.parseInt(page!.toString()) - 1;

  let query = [];

  if (fromDate)
    query.push({ createdAt: { $gte: dayjs(fromDate as string).toDate() } });
  if (toDate)
    query.push({ createdAt: { $lte: dayjs(toDate as string).toDate() } });

  if (status) {
    status = JSON.parse(status!.toString());

    if (status && status.length > 0)
      status =
        (status as any[]).filter((e) => e == null).length > 0 ? [] : status;
  }

  if ((status && status.length > 0) ?? false) {
    query.push({
      $expr: {
        $in: [{ $arrayElemAt: ["$history.status", -1] }, status],
      },
    });
  }

  const total = await Transaction.countDocuments(
    query.length > 0 ? { $and: query } : {}
  );

  return await Transaction.find(query.length > 0 ? { $and: query } : {})
    .skip(_page * Number.parseInt(pageSize!.toString()))
    .limit(Number.parseInt(pageSize!.toString()))
    .sort({
      createdAt: typeof order == "string" && order == "descending" ? -1 : 1,
    })
    .populate("tellerId")
    .then((e: any[]) => {
      return res.json({
        code: 200,
        success: true,
        message: "Successfully fetched",
        data: e,
        meta: {
          total,
        },
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
