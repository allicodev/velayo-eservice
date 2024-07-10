import authMiddleware from "@/assets/ts/apiMiddleware";
import dbConnect from "@/database/dbConnect";
import ItemCategory from "@/database/models/item_category.schema";
import Item from "@/database/models/item.schema";
import { Response } from "@/types";

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

  return await ItemCategory.findOneAndDelete({ _id: req.query.id })
    .then(async (e) => {
      await Item.updateMany(
        { itemCategory: req.query.id },
        { $set: { itemCategory: null } }
      );

      return res.json({
        success: true,
        code: 200,
        message: "Successfully Deleted the Category.",
      });
    })
    .catch((e) =>
      res.json({ success: false, code: 500, message: "Error in the Server" })
    );
}

export default authMiddleware(handler);
