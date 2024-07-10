import authMiddleware from "@/assets/ts/apiMiddleware";
import dbConnect from "@/database/dbConnect";
import ItemCategory from "@/database/models/item_category.schema";
import { ExtendedResponse, ItemWithCategory, Response } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<ItemWithCategory[]>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  return await ItemCategory.aggregate([
    {
      $lookup: {
        from: "items",
        localField: "_id",
        foreignField: "itemCategory",
        as: "items",
      },
    },
  ])
    .then((e) =>
      res.json({
        success: true,
        code: 200,
        message: "Successfully Created",
        data: e,
      })
    )
    .catch((e) =>
      res.json({ success: false, code: 500, message: "Error in the Server" })
    );
}

export default authMiddleware(handler);
