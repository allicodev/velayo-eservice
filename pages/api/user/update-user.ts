import dbConnect from "@/database/dbConnect";
import User from "@/database/models/user.schema";
import { Response } from "@/types";
import bcrypt from "bcryptjs";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  await dbConnect();

  const { method } = req;

  if (method != "POST")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  if (![null, undefined, ""].includes(req.body.password))
    req.body.password = req.body.password = await bcrypt.hash(
      req.body.password,
      8
    );

  return await User.findOneAndUpdate({ _id: req.body._id }, { $set: req.body })
    .then(() => {
      return res.json({
        code: 200,
        success: true,
        message: "User Updated Successfully",
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
