import dbConnect from "@/database/dbConnect";
import Transaction from "@/database/models/transaction.schema";
import { ExtendedResponse, Transaction as TransactionType } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<TransactionType[]>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  let { page, pageSize } = req.query;

  const _page = Number.parseInt(page!.toString()) - 1;

  return await Transaction.find()
    .skip(_page * Number.parseInt(pageSize!.toString()))
    .limit(Number.parseInt(pageSize!.toString()))
    .then((e) => {
      return res.json({
        code: 200,
        success: true,
        message: "Successfully fetched",
        data: e,
      });
    })
    .catch((e) => {
      console.log(e);
      return res.json({
        code: 500,
        success: false,
        message: "There is an error in the Server.",
      });
    });
}

export default handler;
