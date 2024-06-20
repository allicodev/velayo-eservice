import dbConnect from "@/database/dbConnect";
import User from "@/database/models/user.schema";
import { ExtendedResponse, UserWithToken } from "@/types";
import { sign } from "@/assets/ts";

import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";

const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY ?? "";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<UserWithToken>>
) {
  await dbConnect();

  const { method } = req;
  const { username, password } = req.body;

  if (method === "OPTIONS") {
    return res.status(200).end();
  }

  if (method === "POST") {
    const validUser = await User.findOne({
      $or: [{ username }, { email: username }],
    }).lean();

    if (validUser) {
      const validPassword = await bcrypt.compare(password, validUser.password);
      if (validPassword) {
        delete validUser.password;
        delete validUser.createdAt;
        delete validUser.updatedAt;
        delete validUser.__v;

        const token = await sign(validUser, JWT_PRIVATE_KEY);

        res.json({
          code: 200,
          success: true,
          message: "Login Success",
          data: { ...validUser, token },
        });
      } else
        res.json({
          code: 404,
          success: false,
          message: "Invalid Password",
        });
    } else
      res.json({
        code: 404,
        success: false,
        message: "User doesn't exist",
      });
  } else {
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });
  }
}

export default handler;
