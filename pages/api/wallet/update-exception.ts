import dbConnect from "@/database/dbConnect";
import Wallet from "@/database/models/wallet.schema";
import { Response } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  await dbConnect();

  const { method } = req;

  if (method != "POST")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  let { _id, direction, excludeItems, type } = req.body;
  return await Wallet.updateOne(
    { _id },
    direction == "left"
      ? {
          $pull: {
            [type == "cash-in"
              ? "cashInexceptFormField"
              : "cashOutexceptFormField"]: {
              name: { $in: excludeItems.map((e: any) => e.name) },
            },
          },
        }
      : {
          $push: {
            [type == "cash-in"
              ? "cashInexceptFormField"
              : "cashOutexceptFormField"]: { $each: excludeItems },
          },
        },
    {
      returnOriginal: false,
    }
  )
    .then((e) => {
      return res.json({
        code: 200,
        success: true,
        message: "Successfully Updated",
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
