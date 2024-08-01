import UserCredit from "@/database/models/user_credits.schema";
import authMiddleware from "@/assets/ts/apiMiddleware";
import dbConnect from "@/database/dbConnect";
import { Response } from "@/types";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  await dbConnect();

  if (req.method != "GET")
    return res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  return await UserCredit.findOneAndDelete({ _id: req.query._id })
    .then((e) =>
      res.json({ success: true, code: 200, message: "Successfully Deleted" })
    )
    .catch((e) => {
      console.log(e);
      return res.json({
        success: false,
        code: 500,
        message: "Error in the Server",
      });
    });
}

export default authMiddleware(handler);
