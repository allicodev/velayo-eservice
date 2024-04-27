import authMiddleware from "@/assets/ts/apiMiddleware";
import dbConnect from "@/database/dbConnect";
import Wallet from "@/database/models/wallet.schema";
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

  const { _id } = req.query;
  return await Wallet.findOneAndDelete({ _id })
    .then(() => {
      return res.json({
        code: 200,
        success: true,
        message: "Successfully Deleted",
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

export default authMiddleware(handler);
