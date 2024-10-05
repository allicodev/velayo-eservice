import mongoose from "mongoose";

import Log from "@/database/models/log.schema";
import authMiddleware from "@/assets/ts/apiMiddleware";
import dbConnect from "@/database/dbConnect";
import { ExtendedResponse, UserCreditData } from "@/types";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<UserCreditData[]>>
) {
  if (req.method != "GET")
    return res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  await dbConnect();

  const { id } = req.query;

  let query: any[] = [
    {
      $match: {
        type: "credit",
      },
    },
    {
      $unwind: "$history",
    },
    // {
    //   $lookup: {
    //     from: "usercredits",
    //     localField: "userCreditId",
    //     foreignField: "_id",
    //     as: "userCreditId",
    //   },
    // },
    {
      $project: {
        _id: 0,
        userId: "$userCreditId",
        amount: "$history.amount",
        date: "$history.date",
        description: "$history.description",
      },
    },
    {
      $sort: { userId: 1 },
    },
  ];

  if (id) {
    query.unshift({
      $match: {
        userCreditId: new mongoose.Types.ObjectId(id as any),
      },
    });
  }

  return await Log.aggregate(query)
    .then((e) => res.json({ success: true, code: 200, data: e }))
    .catch((e) => {
      console.log(e);
      return res.json({
        success: false,
        code: 500,
        message: "Error in the Server",
      });
    });
}

export default authMiddleware(handler);
