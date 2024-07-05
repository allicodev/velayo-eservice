import { ApiMiddleware } from "@/assets/ts";
import dbConnect from "@/database/dbConnect";
import Request from "@/database/models/request.schema";
import { BalanceRequest, ExtendedResponse, Response } from "@/types";

import mongoose from "mongoose";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<BalanceRequest[] | Response>>
) {
  await dbConnect();

  const { method } = req;

  if (method == "GET") {
    let { page, pageSize, portalId } = req.query;
    if (!page) page = "1";
    if (!pageSize) pageSize = "10";
    let query = [];

    if (portalId)
      query.push({ portalId: new mongoose.Types.ObjectId(portalId as any) });

    let total = await Request.countDocuments(
      query.length > 0 ? { $and: query } : {}
    );

    return await Request.aggregate([
      {
        $match: {
          ...(query.length > 0 ? { $and: query } : {}),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "encoderId",
          foreignField: "_id",
          as: "encoderId",
        },
      },
      {
        $unwind: "$encoderId",
      },
      {
        $addFields: {
          statusScore: {
            $cond: {
              if: { $eq: ["$status", "pending"] },
              then: 1,
              else: {
                $cond: {
                  if: { $eq: ["$status", "rejected"] },
                  then: 2,
                  else: 3,
                },
              },
            },
          },
        },
      },
      { $sort: { statusScore: 1 } },
      {
        $skip:
          (Number.parseInt(page.toString()) - 1) *
          Number.parseInt(pageSize!.toString()),
      },
      {
        $limit: Number.parseInt(pageSize!.toString()),
      },
    ]).then((e) =>
      res.json({
        code: 200,
        success: true,
        data: e as any,
        meta: {
          total: total as any,
        },
      })
    );
  } else {
    const { _id } = req.body;

    if (_id) {
      return await Request.findOneAndUpdate(
        { _id },
        { $set: req.body },
        { returnOriginal: false }
      )
        .then((e) =>
          res.json({
            code: 200,
            success: true,
            message: "Successfully Updated",
            data: e,
          })
        )
        .catch((e) => {
          console.log(e);
          return res.json({
            code: 500,
            success: false,
            message: "Error in the Server",
          });
        });
    } else {
      return await Request.create(req.body)
        .then((e) =>
          res.json({
            code: 200,
            success: true,
            message: "Successfully Requested",
          })
        )
        .catch((e) => {
          console.log(e);
          return res.json({
            code: 500,
            success: false,
            message: "Error in the Server",
          });
        });
    }
  }
}

export default ApiMiddleware(handler);
