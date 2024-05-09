import authMiddleware from "@/assets/ts/apiMiddleware";
import dbConnect from "@/database/dbConnect";
import Item from "@/database/models/item.schema";
import { ExtendedResponse, ItemData } from "@/types";

import mongoose from "mongoose";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<ItemData>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  return await Item.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.query.id as string),
      },
    },
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
      $project: {
        _id: 1,
        name: 1,
        parentName: 1,
        quantity: 1,
        itemCode: 1,
        price: 1,
        cost: 1,
      },
    },
  ])
    .then((e) => res.json({ success: true, code: 200, data: e[0] as any }))
    .catch((e) =>
      res.json({ success: false, code: 500, message: "Error in the Server" })
    );
}

export default authMiddleware(handler);
