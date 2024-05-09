import authMiddleware from "@/assets/ts/apiMiddleware";
import dbConnect from "@/database/dbConnect";
import Item from "@/database/models/item.schema";
import { ExtendedResponse, ItemData } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<ItemData[]>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  if (req.query?.search == "")
    return res.json({ success: true, code: 200, data: [] });
  try {
    let data = await Item.aggregate([
      ...(req.query?.search ?? false
        ? [
            {
              $match: {
                name: {
                  $regex: new RegExp(
                    req.query!.search!.toString().toLowerCase().trim(),
                    "i"
                  ),
                },
              },
            },
          ]
        : []),
      {
        $graphLookup: {
          from: "items",
          startWith: "$_id",
          connectFromField: "parentId",
          connectToField: "_id",
          as: "parents",
          depthField: "depth",
        },
      },
      {
        $unwind: "$parents",
      },
      {
        $sort: {
          "parents.depth": 1,
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          isParent: { $first: "$isParent" },
          quantity: { $first: "$quantity" },
          itemCode: { $first: "$itemCode" },
          price: { $first: "$price" },
          cost: { $first: "$cost" },
          parents: { $push: "$parents" },
        },
      },
      {
        $addFields: {
          parentName: {
            $reduce: {
              input: {
                $filter: {
                  input: "$parents",
                  cond: { $ne: ["$$this._id", "$_id"] },
                },
              },
              initialValue: "",
              in: {
                $concat: [
                  "$$value",
                  { $cond: [{ $eq: ["$$value", ""] }, "", " - "] },
                  "$$this.name",
                ],
              },
            },
          },
        },
      },
      {
        $match: {
          cost: { $ne: null },
        },
      },
      {
        $project: {
          name: 1,
          parentName: 1,
          quantity: 1,
          itemCode: 1,
          price: 1,
          cost: 1,
        },
      },
    ]);

    return res.json({ success: true, code: 200, data });
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
