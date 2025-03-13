import { ApiMiddleware } from "@/assets/ts";
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

  const { id } = req.query;
  return await User.findOneAndDelete({ _id: id })
    .then(() => {
      return res.json({
        code: 200,
        success: true,
        message: "User Removed Successfully",
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
