import authMiddleware from "@/assets/ts/apiMiddleware";
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

  if (method === "OPTIONS") return res.status(200).end();

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  return await Settings.findById("eload_settings").then((e) =>
    res.json({ code: 200, success: true, data: e })
  );
}

export default handler;
