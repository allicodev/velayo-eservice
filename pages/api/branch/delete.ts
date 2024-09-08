import { ApiMiddleware } from "@/assets/ts";
import dbConnect from "@/database/dbConnect";
import Branch from "@/database/models/branch.schema";
import { ExtendedResponse, Branch as BranchProp } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<BranchProp[]> | Response>
) {
  await dbConnect();

  const { method } = req;

  if (method === "OPTIONS") return res.status(200).end();

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  if (method == "GET")
    return await Branch.findOneAndDelete({ _id: req.query._id })
      .then((e) => {
        return res.json({
          code: 200,
          success: true,
          message: "Successfully Deleted the branch",
          data: e as any,
        });
      })
      .catch((e) => {
        return res.json({
          code: 500,
          success: false,
          message: "There is an error in the Server.",
        });
      });
}

export default handler;
