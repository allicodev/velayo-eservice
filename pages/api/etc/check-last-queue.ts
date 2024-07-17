import dbConnect from "@/database/dbConnect";
import Settings from "@/database/models/settings.schema";
import { ExtendedResponse, Response } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<number>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  try {
    let exists = await Settings.findById("queue_settings");

    if (!exists) return res.json({ success: true, code: 200, data: 0 });

    let branchId = req.query.branchId;

    return res.json({
      success: true,
      code: 200,
      data: exists.queue.filter((e: any) => e.id == branchId)[0].queue,
    });
  } catch (e) {
    console.log(e);
    return res.json({
      success: false,
      code: 500,
      message: "Error in the Server",
    });
  }
}

export default handler;
