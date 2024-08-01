import dbConnect from "@/database/dbConnect";
import Transaction from "@/database/models/transaction.schema";
import { ExtendedResponse, SalesPerMonth } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

type FilterProp = {
  type: null | "bills" | "wallet" | "eload" | "miscellaneous";
  year: number;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<SalesPerMonth>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  if (method == "OPTIONS") return res.status(200);

  const salesPerMonth = await Transaction.aggregate([
    {
      $match: {
        $and: [
          {
            $expr: {
              $eq: [{ $last: "$history.status" }, "completed"],
            },
          },
          ...([null, undefined].includes(req.query.type as any)
            ? [{}]
            : [{ type: req.query.type }]),
          ...([null, undefined].includes(req.query.year as any)
            ? [{}]
            : [
                {
                  $expr: {
                    $eq: [{ $year: "$createdAt" }, req.query.year],
                  },
                },
              ]),
        ],
      },
    },
    {
      $project: {
        month: { $month: "$createdAt" },
        year: { $year: "$createdAt" },
        sales: { $add: ["$amount", "$fee"] },
      },
    },
    {
      $group: {
        _id: { month: "$month" },
        sales: { $sum: "$sales" },
      },
    },
    {
      $sort: {
        "_id.month": 1,
      },
    },
    {
      $project: {
        _id: 0,
        Jan: { $cond: [{ $eq: ["$_id.month", 1] }, "$sales", 0] },
        Feb: { $cond: [{ $eq: ["$_id.month", 2] }, "$sales", 0] },
        Mar: { $cond: [{ $eq: ["$_id.month", 3] }, "$sales", 0] },
        Apr: { $cond: [{ $eq: ["$_id.month", 4] }, "$sales", 0] },
        May: { $cond: [{ $eq: ["$_id.month", 5] }, "$sales", 0] },
        Jun: { $cond: [{ $eq: ["$_id.month", 6] }, "$sales", 0] },
        Jul: { $cond: [{ $eq: ["$_id.month", 7] }, "$sales", 0] },
        Aug: { $cond: [{ $eq: ["$_id.month", 8] }, "$sales", 0] },
        Sep: { $cond: [{ $eq: ["$_id.month", 9] }, "$sales", 0] },
        Oct: { $cond: [{ $eq: ["$_id.month", 10] }, "$sales", 0] },
        Nov: { $cond: [{ $eq: ["$_id.month", 11] }, "$sales", 0] },
        Dec: { $cond: [{ $eq: ["$_id.month", 12] }, "$sales", 0] },
      },
    },
  ]).then((e) => {
    let obj = e[0];

    for (let i = 1; i < e.length; i++) {
      Object.values(e[i]).map((_, ii) => {
        if (_ != 0) obj[Object.keys(e[i])[ii]] = _;
      });
    }

    return obj;
  });

  res.json({
    success: true,
    data: salesPerMonth,
    code: 200,
  });
}

export default handler;
