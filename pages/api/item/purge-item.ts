import authMiddleware from "@/assets/ts/apiMiddleware";
import dbConnect from "@/database/dbConnect";
import Item from "@/database/models/item.schema";
import { Response } from "@/types";

import mongoose from "mongoose";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  let data = await Item.aggregate([
    {
      $graphLookup: {
        from: "items",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parentId",
        as: "children",
        depthField: "depth",
      },
    },
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.query.id as string),
      },
    },
    {
      $project: {
        _id: 1,
        children: 1,
      },
    },
  ]);
  let ids = data[0].children.map((e: any) => e._id);
  ids.push(data[0]._id);

  return await Item.deleteMany({ _id: { $in: ids } })
    .then((e) =>
      res.json({
        success: true,
        code: 200,
        message: "Successfully Deleted the Item.",
      })
    )
    .catch((e) =>
      res.json({ success: false, code: 500, message: "Error in the Server" })
    );
}

export default authMiddleware(handler);
