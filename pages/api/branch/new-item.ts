import dbConnect from "@/database/dbConnect";
import Branch from "@/database/models/branch.schema";
import { BranchData, ExtendedResponse } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<BranchData>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "POST")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  let { _id, itemIds } = req.body;

  return await Branch.findOneAndUpdate(
    { _id },
    {
      $push: {
        items: itemIds?.map((e: any) => ({
          itemId: e,
          stock_count: 0,
          createdAt: new Date().toISOString(),
        })),
      },
    },
    {
      returnOriginal: false,
    }
  )
    .populate("items.itemId")
    .then((e) => {
      return res.json({
        code: 200,
        success: true,
        message: "Successfully Added",
        data: e,
      });
    })
    .catch((e) => {
      console.log(e);
      return res.json({
        code: 500,
        success: false,
        message: "There is an error in the Server.",
      });
    });
}

export default handler;
