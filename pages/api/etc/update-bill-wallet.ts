import dbConnect from "@/database/dbConnect";
import Bill from "@/database/models/bill.schema";
import Wallet from "@/database/models/wallet.schema";
import { Pusher2 } from "@/provider/utils/pusher";
import { ExtendedResponse, BillingSettingsType } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<BillingSettingsType>>
) {
  await dbConnect();

  const { method } = req;

  if (method != "POST")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  try {
    let { wallets, bills } = req.body;
    let _wallets: any[] = [],
      _bills: any[] = [];

    await Promise.all(
      wallets.map(async (e: any) => {
        return await Wallet.findOneAndUpdate(
          { _id: e.id },
          { $set: { isDisabled: e.isDisabled } }
        ).then((_) => {
          if ((_?.isDisabled ?? null) != e.isDisabled) _wallets.push(e);
        });
      })
    );

    await Promise.all(
      bills.map(async (e: any) => {
        return await Bill.findOneAndUpdate(
          { _id: e.id },
          { $set: { isDisabled: e.isDisabled } }
        ).then((_) => {
          if ((_?.isDisabled ?? null) != e.isDisabled) _bills.push(e);
        });
      })
    );

    if (_wallets.length + _bills.length > 0)
      await new Pusher2().emit("teller-general", "notify-disabled-wallet", {
        data: [
          ..._bills.map((e) => ({ _id: e.id, isDisabled: e.isDisabled })),
          ..._wallets.map((e) => ({ _id: e.id, isDisabled: e.isDisabled })),
        ],
      });

    return res.json({
      code: 200,
      success: true,
      message: "Successfully updated",
    });
  } catch (e) {
    console.log(e);
    return res.json({
      code: 500,
      success: false,
      message: "There is an error in the Server.",
    });
  }
}

export default handler;
