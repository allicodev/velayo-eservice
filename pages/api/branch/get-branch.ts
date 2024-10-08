import dbConnect from "@/database/dbConnect";
import Branch from "@/database/models/branch.schema";
import { BranchData, ExtendedResponse } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<BranchData>>
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

  return await Branch.findOne({ _id: req.query._id })
    .populate("items.itemId")
    .then((e) => {
      return res.json({
        code: 200,
        success: true,
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
