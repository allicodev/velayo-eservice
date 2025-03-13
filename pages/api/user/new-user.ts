import dbConnect from "@/database/dbConnect";
import User from "@/database/models/user.schema";
import { ExtendedResponse, User as UserProps } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { ApiMiddleware } from "@/assets/ts";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<UserProps>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "POST")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  let exist = await User.find({
    $or: [
      {
        email: req.body.email,
      },
      {
        username: req.body.username,
      },
      {
        name: req.body.name,
      },
    ],
  });

  if (exist.length > 0)
    return res.json({
      success: false,
      code: 409,
      message: "User already exist",
    });

  req.body.role = req.body.role.toLocaleLowerCase();
  req.body.password = await bcrypt.hash(req.body.password, 8);

  return await User.create(req.body)
    .then((e) => {
      return res.json({
        success: true,
        code: 200,
        message: "Successfully Created",
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

export default ApiMiddleware(handler);
