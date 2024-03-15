import dbConnect from "@/database/dbConnect";
import User from "@/database/models/user.schema";
import { ExtendedResponse, User as UserProps } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<UserProps>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  let exist = await User.find({ role: "admin" });

  if (exist.length > 0)
    return res.json({
      success: false,
      code: 409,
    });

  let password = await bcrypt.hash("password", 8);
  return await User.create({
    name: "Admin",
    email: "admin@email.com",
    username: "admin",
    password,
    role: "admin",
  })
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

export default handler;
