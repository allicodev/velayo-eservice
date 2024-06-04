import { ApiMiddleware } from "@/assets/ts";
import dbConnect from "@/database/dbConnect";
import Request from "@/database/models/request.schema";
import { BalanceRequest, ExtendedResponse, Response } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<BalanceRequest[] | Response>>
) {
  await dbConnect();

  const { method } = req;

  if (method == "GET") {
    let { page, pageSize, portalId } = req.query;
    if (!page) page = "1";
    if (!pageSize) pageSize = "10";
    let query = [];

    if (portalId) query.push({ portalId });

    return await Request.find(query.length > 0 ? { $and: query } : {})
      .skip(
        (Number.parseInt(page.toString()) - 1) *
          Number.parseInt(pageSize!.toString())
      )
      .limit(Number.parseInt(pageSize!.toString()))
      .populate("portalId encoderId")
      .then((e) => res.json({ code: 200, success: true, data: e as any }));
  } else {
    const { _id } = req.body;

    if (_id) {
      return await Request.findOneAndUpdate(
        { _id },
        { $set: req.body },
        { returnOriginal: false }
      )
        .then((e) =>
          res.json({
            code: 200,
            success: true,
            message: "Successfully Updated",
            data: e,
          })
        )
        .catch((e) => {
          console.log(e);
          return res.json({
            code: 500,
            success: false,
            message: "Error in the Server",
          });
        });
    } else {
      return await Request.create(req.body)
        .then((e) =>
          res.json({
            code: 200,
            success: true,
            message: "Successfully Requested",
          })
        )
        .catch((e) => {
          console.log(e);
          return res.json({
            code: 500,
            success: false,
            message: "Error in the Server",
          });
        });
    }
  }
}

export default ApiMiddleware(handler);
