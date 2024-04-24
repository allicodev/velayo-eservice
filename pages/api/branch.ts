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

  if (method == "GET")
    return await Branch.find()
      .then((e) => {
        return res.json({
          code: 200,
          success: true,
          message: "Successfully Fetched wallets",
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
  else {
    const { _id } = req.body;

    if (_id) {
      return await Branch.findOneAndUpdate({ _id }, req.body)
        .then(() =>
          res.json({
            code: 200,
            success: true,
            message: "Successfully Updated the Branch",
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
    } else {
      return await Branch.create(req.body).then((e) =>
        res.json({
          code: 200,
          success: true,
          message: "Successfully Added new Branch",
        })
      );
    }
  }
}

export default handler;
