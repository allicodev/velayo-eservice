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

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  let { branchId, itemId } = req.query;

  return await Branch.findOneAndUpdate(
    { _id: branchId },
    {
      $pull: {
        items: {
          itemId,
        },
      },
    }
  )
    .then((e) => {
      return res.json({
        code: 200,
        success: true,
        message: "Successfully Deleted",
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

export default authMiddleware(handler);
