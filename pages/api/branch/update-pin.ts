import authMiddleware from "@/assets/ts/apiMiddleware";
import dbConnect from "@/database/dbConnect";
import Branch from "@/database/models/branch.schema";
import { ExtendedResponse, Response } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<Response>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "POST")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  const { _id, pin } = req.body;

  return await Branch.findOneAndUpdate({ _id }, { $set: { pin } })
    .then((e) =>
      res.json({
        code: 200,
        success: true,
        message: "Successfully Updated",
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

export default authMiddleware(handler);
