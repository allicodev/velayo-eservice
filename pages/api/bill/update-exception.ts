import dbConnect from "@/database/dbConnect";
import Bill from "@/database/models/bill.schema";
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

  let { _id, direction, excludeItems } = req.body;
  return await Bill.updateOne(
    { _id },
    direction == "left"
      ? {
          $pull: {
            exceptFormField: {
              name: { $in: excludeItems.map((e: any) => e.name) },
            },
          },
        }
      : {
          $push: {
            exceptFormField: { $each: excludeItems },
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
