import dbConnect from "@/database/dbConnect";
import Transaction from "@/database/models/transaction.schema";
import { Response } from "@/types";
import { PusherBE } from "@/provider/utils/pusher";

import type { NextApiRequest, NextApiResponse } from "next";

const pusher = new PusherBE();

async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  await dbConnect();

  const { method } = req;

  if (method != "POST")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  return await Transaction.create(req.body)
    .then(() => {
      pusher.emit("encoder", "notify", {});
      return res.json({
        code: 200,
        success: true,
        message: "Transaction has been sent",
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
