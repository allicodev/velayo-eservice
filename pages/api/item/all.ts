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

  return await Item.find()
    .then((e) => res.json({ success: true, code: 200, data: e }))
    .catch((e) =>
      res.json({ success: false, code: 500, message: "Error in the Server" })
    );
}

export default authMiddleware(handler);
