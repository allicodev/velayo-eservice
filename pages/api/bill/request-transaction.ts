import dbConnect from "@/database/dbConnect";
import Transaction from "@/database/models/transaction.schema";
import {
  ExtendedResponse,
  Response,
  TransactionPOS as TransactionProp,
} from "@/types";
import { Pusher2 } from "@/provider/utils/pusher";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<TransactionProp> | Response>
) {
  await dbConnect();

  const { method } = req;

  if (method != "POST")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  return await Transaction.create(req.body)
    .then(async (e) => {
      if (req.body.type == "miscellaneous") {
        if (req.body.isOnlinePayment)
          await new Pusher2().emit("encoder", "notify", {});
      } else await new Pusher2().emit("encoder", "notify", {});

      return res.json({
        code: 200,
        success: true,
        message: "Transaction has been sent",
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
