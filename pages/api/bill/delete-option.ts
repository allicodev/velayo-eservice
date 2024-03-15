import dbConnect from "@/database/dbConnect";
import Bill from "@/database/models/bill.schema";
import { ExtendedResponse, BillingSettingsType } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<BillingSettingsType[]>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });
  let { id, index } = req.query;
  const i = parseInt(index as string, 10);

  return await Bill.findOneAndUpdate({ _id: id }, [
    {
      $set: {
        formField: {
          $concatArrays: [
            {
              $slice: ["$formField", i],
            },
            {
              $slice: [
                "$formField",
                i + 1,
                {
                  $size: "$formField",
                },
              ],
            },
          ],
        },
      },
    },
  ])
    .then((e) => {
      return res.json({
        code: 200,
        success: true,
        message: "Successfully deleted",
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
