import authMiddleware from "@/assets/ts/apiMiddleware";
import dbConnect from "@/database/dbConnect";
import Item from "@/database/models/item.schema";
import { ExtendedResponse, Item as ItemProp } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<ItemProp>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "POST")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  return await Item.findOneAndUpdate(
    { _id: req.body.id },
    { $set: req.body },
    { new: true }
  )
    .then((e) =>
      res.json({
        success: true,
        code: 200,
        message: "Successfully Updated the Item.",
        data: e,
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

export default authMiddleware(handler);
