import UserCredit from "@/database/models/user_credits.schema";
import authMiddleware from "@/assets/ts/apiMiddleware";
import dbConnect from "@/database/dbConnect";
import { ExtendedResponse, UserCreditData } from "@/types";
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<UserCreditData[]>>
) {
  await dbConnect();

  if (req.method == "GET") {
    let query = [];

    if (req.query?.searchWord ?? false) {
      const re = new RegExp(req.query.searchWord!.toString().trim(), "i");
      query.push({
        $match: {
          $or: [
            { name: { $regex: re } },
            { middlename: { $regex: re } },
            { lastname: { $regex: re } },
          ],
        },
      });
    }

    if (req.query?._id ?? false) {
      query.push({
        $match: {
          _id: new mongoose.Types.ObjectId(req.query._id as string),
        },
      });
    }

    return await UserCredit.aggregate([
      ...query,
      {
        $lookup: {
          from: "logs",
          localField: "_id",
          foreignField: "userCreditId",
          pipeline: [
            {
              $match: {
                type: "credit",
              },
            },
          ],
          as: "history",
        },
      },
    ])
      .then((e) => res.json({ success: true, code: 200, data: e }))
      .catch((e) => {
        console.log(e);
        return res.json({
          success: false,
          code: 500,
          message: "Error in the Server",
        });
      });
  } else if (req.method == "POST") {
    const { _id } = req.body;

    if (_id) {
      return await UserCredit.findOneAndUpdate({ _id }, { $set: req.body })
        .then((e) =>
          res.json({
            success: true,
            code: 200,
            message: "Successfully Updated",
          })
        )
        .catch((e) => {
          console.log(e);
          return res.json({
            success: false,
            code: 500,
            message: "Error in the Server",
          });
        });
    }

    return await UserCredit.create(req.body)
      .then(() =>
        res.json({ success: true, code: 200, message: "Successfully Created" })
      )
      .catch((e) => {
        console.log(e);
        return res.json({
          success: false,
          code: 500,
          message: "Error in the Server",
        });
      });
  }
}

export default authMiddleware(handler);
