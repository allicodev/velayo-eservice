import dbConnect from "@/database/dbConnect";
import Transaction from "@/database/models/transaction.schema";
import Branch from "@/database/models/branch.schema";
import { DashboardData, ExtendedResponse } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<DashboardData>>
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

  const totalSales = await Transaction.aggregate([
    {
      $match: {
        $expr: {
          $eq: [{ $last: "$history.status" }, "completed"],
        },
      },
    },
    {
      $addFields: {
        amountWithFee: {
          $sum: ["$amount", "$fee"],
        },
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$amountWithFee",
        },
        feeTotal: {
          $sum: "$fee",
        },
      },
    },
  ]);

  const totalTransaction = await Transaction.aggregate([
    {
      $match: {
        $expr: {
          $eq: [{ $last: "$history.status" }, "completed"],
        },
      },
    },
    {
      $count: "count",
    },
  ]);

  const totalTransactionToday = await Transaction.count({
    createdAt: {
      $gte: dayjs().tz("Asia/Manila").startOf("day").toDate(),
    },
    $lte: dayjs().tz("Asia/Manila").endOf("day").toDate(),
  });

  const branchSales = await Branch.aggregate([
    {
      $lookup: {
        from: "transactions",
        localField: "_id",
        foreignField: "branchId",
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [{ $last: "$history.status" }, "completed"],
              },
            },
          },
          {
            $count: "count",
          },
        ],
        as: "logs",
      },
    },
    {
      $addFields: {
        total: {
          $first: "$logs.count",
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: 1,
        total: 1,
      },
    },
  ]).then((e) => {
    let total = e.reduce((p, n) => p + (n?.total ?? 0), 0);

    return e.map((_) => {
      _.percentValue =
        _.total == 0 ? 0 : (((_?.total ?? 0) / total) * 100).toFixed(2);
      return _;
    });
  });

  const topItemSales = await Transaction.aggregate([
    {
      $match: {
        $and: [
          { type: "miscellaneous" },
          {
            $expr: {
              $eq: [{ $last: "$history.status" }, "completed"],
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        transactionDetails: 1,
      },
    },
  ]).then((e) => {
    let items: any[] = [];
    let finalItems: any[] = [];

    e.forEach((_) => {
      items = [...items, ...JSON.parse(_.transactionDetails)];
    });

    items.forEach((item, i) => {
      let index = finalItems.map((e) => e.name).indexOf(item.name);

      if (finalItems.length == 0 || index == -1) {
        finalItems.push({
          name: item.name,
          quantity: item.quantity,
        });
      } else {
        finalItems[index].quantity += item.quantity;
      }
    });

    return finalItems
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3)
      .map((e) => ({ ...e, quantity: parseInt(e.quantity) }));
  });

  const salesPerMonth = await Transaction.aggregate([
    {
      $match: {
        $expr: {
          $eq: [{ $last: "$history.status" }, "completed"],
        },
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
      $match: {
        year: 2024,
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

  const salesPerType = await Transaction.aggregate([
    {
      $group: {
        _id: {
          type: "$type",
          month: { $month: "$createdAt" },
        },
        total: { $sum: { $add: ["$amount", "$fee"] } }, // Combine amount and fee
      },
    },
    {
      $group: {
        _id: "$_id.type",
        sales: {
          $push: {
            k: {
              $toString: {
                $arrayElemAt: [
                  [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ],
                  { $subtract: ["$_id.month", 1] },
                ],
              },
            },
            v: "$total",
          },
        },
      },
    },
  ]).then((e) => {
    e.forEach((el, i) => {
      e[i].sales = el.sales
        .map((_: any) => ({ [_.k]: _.v }))
        .reduce((p: any, n: any) => ({ ...p, ...n }), {});
    });
    return e;
  });

  res.json({
    success: true,
    data: {
      totalTransaction: totalTransaction[0]?.count ?? 0,
      totalTransactionToday: totalTransactionToday,
      totalSales: totalSales[0]?.total ?? 0,
      totalNetSales: totalSales[0]?.feeTotal ?? 0,
      totalBranch: branchSales.length,
      branchSales,
      topItemSales,
      salesPerMonth,
      salesPerType,
    },
    code: 200,
  });
}

export default handler;
