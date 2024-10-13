import dbConnect from "@/database/dbConnect";
import User from "@/database/models/user.schema";
import UserCredit from "@/database/models/user_credits.schema";
import { ExtendedResponse, ProtectedUser } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<ProtectedUser[]>>
) {
  await dbConnect();

  const { method } = req;

  if (method === "OPTIONS") {
    return res.status(200).end();
  }

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  const { type } = req.query;

  if (type == "credit") {
    let { page = 1, pageSize = 10 } = req.query;
    page = Number.parseInt(page.toString()) - 1;

    return UserCredit.find()
      .skip(page * Number.parseInt(pageSize.toString()))
      .limit(Number.parseInt(pageSize.toString()))
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
  }

  let { page, pageSize, employeeId, role, notRole, searchKey } = req.query;
  var re;

  if (role) role = JSON.parse(role as string);
  if (notRole) notRole = JSON.parse(role as string);

  if (searchKey && searchKey != "") {
    re = new RegExp(searchKey!.toString().trim(), "i");
  }

  if (employeeId) {
    delete req.query.employeeId;
    return await User.findOne({ _id: req.query._id })
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
  } else if (notRole) {
    return await User.find({ role: { $nin: notRole } })
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

    const total = await User.countDocuments(
      searchKey
        ? { role: { $ne: "admin" }, name: { $regex: re } }
        : { role: { $ne: "admin" } }
    );

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
          meta: {
            total,
          },
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
