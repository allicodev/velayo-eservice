import dbConnect from "@/database/dbConnect";
import Branch from "@/database/models/branch.schema";
import Log from "@/database/models/log.schema";
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

  let { _id, items, type, transactId } = req.body;

  if (items && typeof items[0] == "string")
    items = items.map((e: any) => JSON.parse(e));

  try {
    items.map(async (_item: any) => {
      await Branch.updateMany(
        { _id, "items.itemId": _item._id },
        { $inc: { "items.$.stock_count": _item.count } }
      );
    });

    await Log.create({
      type: "stock",
      branchId: _id,
      stockType: type,

      items: items.map((e: any) => ({
        itemId: e._id,
        stock_count: e.count,
        createdAt: new Date().toISOString(),
      })),
      ...(transactId ? { transactionId: transactId } : {}),
    });

    return res.json({
      code: 200,
      success: true,
      message: "Successfully Added",
    });
  } catch (e) {
    console.log(e);
    return res.json({
      code: 500,
      success: false,
      message: "There is an error in the Server.",
    });
  }
}

export default handler;
