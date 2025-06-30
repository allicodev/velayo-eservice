import _ from "lodash";

import { ApiMiddleware } from "@/assets/ts";
import dbConnect from "@/database/dbConnect";
import { ExtendedResponse } from "@/types";

import FeeThresholdModel from "@/database/models/fee_threshold.schema";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<any>>
) {
  await dbConnect();

  const { method } = req;

  if (method == "GET") {
    const { type, link_id, ...rest } = req.query ?? {};
    const query = {
      type,
      link_id,
      ...((rest as Object) ?? {}),
    };
    return await FeeThresholdModel.find(query)
      .then((e) =>
        res.json({
          code: 200,
          success: true,
          message: "Successfully Fetched",
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
  } else if (method == "POST") {
    let { _id } = req.body;

    if (_id)
      return await FeeThresholdModel.findOneAndUpdate(
        { _id },
        { $set: req.body }
      )
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
    const { type, link_id, minAmount, maxAmount, charge, subType } =
      req.body ?? {};
    const payload = { type, link_id, minAmount, maxAmount, charge, subType };
    return await FeeThresholdModel.create(payload)
      .then((e) =>
        res.json({
          code: 200,
          success: true,
          message: "Successfully Created",
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
}

export default ApiMiddleware(handler);
