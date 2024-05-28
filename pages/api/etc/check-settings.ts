import dbConnect from "@/database/dbConnect";
import Settings from "@/database/models/settings.schema";
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

  let exists = await Settings.findById("eload_settings");

  if (!exists) {
    return await Settings.create({
      _id: "eload_settings",
      disabled_eload: [],
    }).then((e) =>
      res.json({
        code: 200,
        success: true,
      })
    );
  }

  res.json({ success: false, code: 202 });
}

export default handler;
