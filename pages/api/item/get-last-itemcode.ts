import authMiddleware from "@/assets/ts/apiMiddleware";
import dbConnect from "@/database/dbConnect";
import Item from "@/database/models/item.schema";
import { ExtendedResponse, ItemCode } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<ItemCode>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  return await Item.findOne()
    .sort({ $natural: -1 })
    .limit(1)
    .then((e) => {
      if (!e) {
        return res.json({
          success: true,
          code: 200,
          data: {
            value: 0,
          },
        });
      }
      return res.json({
        success: true,
        code: 200,
        data: {
          value: (e as any).itemCode,
        },
      });
    })
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
