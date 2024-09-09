import dbConnect from "@/database/dbConnect";
import {
  queueResetter,
  creditInterestChecker,
  resetTellerInitialBalance,
  attendancePhotoResetter,
} from "@/provider/utils";
import { ExtendedResponse, Response } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<Response>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  await queueResetter();
  await creditInterestChecker();
  await resetTellerInitialBalance();
  await attendancePhotoResetter(res);
}

export default handler;
