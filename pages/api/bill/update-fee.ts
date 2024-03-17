import dbConnect from "@/database/dbConnect";
import Bill from "@/database/models/bill.schema";
import { ExtendedResponse, BillingSettingsType } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<BillingSettingsType>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });
  let { id } = req.query;

  return await Bill.findOneAndUpdate(
    { _id: id },
    {
      $set: req.query,
    }
  )
    .then(async (e) =>
      res.json({
        code: 200,
        success: true,
        message: "Successfully updated",
        data: e,
      })
    )
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
