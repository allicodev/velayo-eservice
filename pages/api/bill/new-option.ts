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

  if (method != "POST")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  let { id, formField } = req.body;

  return await Bill.findOneAndUpdate(
    { _id: id },
    { $push: { formField } },
    { new: true }
  )
    .then((e) => {
      return res.json({
        code: 200,
        success: true,
        message: "Successfully add as new Option",
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
