import authMiddleware from "@/assets/ts/apiMiddleware";
import dbConnect from "@/database/dbConnect";

import Branch from "@/database/models/branch.schema";
import Item from "@/database/models/item.schema";
import { BranchData, ExtendedResponse } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<BranchData[]>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });
  let { _id } = req.query;

  if (_id)
    return await Branch.find(_id ? { _id } : {})
      .populate("items.itemId")
      .then((e) => res.json({ success: true, code: 200, data: e as any }))
      .catch((e) =>
        res.json({ success: false, code: 500, message: "Error in the Server" })
      );

  return await Item.aggregate([
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
      $lookup: {
        from: "itemcategories",
        localField: "itemCategory",
        foreignField: "_id",
        as: "itemCategory",
      },
    },
    {
      $unwind: { path: "$itemCategory", preserveNullAndEmptyArrays: true },
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
        parentId: { $first: "$parentId" },
        createdAt: { $first: "$createdAt" },
        itemCategory: { $first: "$itemCategory" },
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
                { $cond: [{ $eq: ["$$value", ""] }, "", " > "] },
                "$$this.name",
              ],
            },
          },
        },
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
    {
      $project: { parents: 0 },
    },
  ])
    .then((e) => {
      console.log(e[0]);
      return res.json({ success: true, code: 200, data: e });
    })
    .catch((e) =>
      res.json({ success: false, code: 500, message: "Error in the Server" })
    );
}

export default authMiddleware(handler);
