import dbConnect from "@/database/dbConnect";
import Bill from "@/database/models/bill.schema";
import Wallet from "@/database/models/wallet.schema";
import { ExtendedResponse, Response } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<Response>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  const { type, id } = req.query;

  if (type == "biller") {
    return await Bill.findOne({ _id: id }).then((e) => {
      return res.json({
        success: e.isDisabled,
        code: 200,
      });
    });
  } else {
    return await Wallet.findOne({ _id: id }).then((e) => {
      return res.json({
        success: e?.isDisabled ?? false,
        code: 200,
      });
    });
  }
}

export default handler;
