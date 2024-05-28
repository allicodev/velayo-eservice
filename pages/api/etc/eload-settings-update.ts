import dbConnect from "@/database/dbConnect";
import Settings from "@/database/models/settings.schema";
import { EloadSettings, ExtendedResponse, Response } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<EloadSettings>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "POST")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  return await Settings.findOneAndUpdate(
    { _id: "eload_settings" },
    { $set: { disabled_eload: req.body.settings } }
  ).then((e) => res.json({ code: 200, success: true, data: e }));
}

export default handler;
