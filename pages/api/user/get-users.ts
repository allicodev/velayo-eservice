import dbConnect from "@/database/dbConnect";
import User from "@/database/models/user.schema";
import { ExtendedResponse, ProtectedUser } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<ProtectedUser[]>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  const { page, pageSize, employeeId, role, searchKey } = req.query;
  var re;

  if (searchKey && searchKey != "") {
    re = new RegExp(searchKey!.toString().trim(), "i");
  }

  if (employeeId) {
    return await User.findOne(req.query)
      .then((e) => {
        return res.json({
          code: 200,
          success: true,
          message: "Fetched Successfully",
          data: e,
        });
      })
      .catch((e) => {
        console.log(e);
        return res.json({
          code: 500,
          success: false,
          message: "Error in the Server",
        });
      });
  } else if (role) {
    return await User.find(
      searchKey ? { role, name: { $regex: re } } : { role: { $in: role } }
    )
      .then((e) => {
        return res.json({
          code: 200,
          success: true,
          message: "Fetched Successfully",
          data: e,
        });
      })
      .catch((e) => {
        console.log(e);
        return res.json({
          code: 500,
          success: false,
          message: "Error in the Server",
        });
      });
  } else {
    const _page = Number.parseInt(page!.toString()) - 1;

    return await User.find(
      searchKey
        ? { role: { $ne: "admin" }, name: { $regex: re } }
        : { role: { $ne: "admin" } }
    )
      .skip(_page * Number.parseInt(pageSize!.toString()))
      .limit(Number.parseInt(pageSize!.toString()))
      .then((doc) => {
        return res.json({
          code: 200,
          success: true,
          message: "Fetched Successfully",
          data: doc,
        });
      })
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

export default handler;
