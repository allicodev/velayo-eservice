import { ApiMiddleware } from "@/assets/ts";
import dbConnect from "@/database/dbConnect";
import Notification from "@/database/models/notification.schema";
import { ExtendedResponse, Notification as NotificationProp } from "@/types";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { Pusher2 } from "@/provider/utils/pusher";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<NotificationProp[]>>
) {
  await dbConnect();

  const { method } = req;

  if (method == "GET") {
    let { page, pageSize, fromDate, toDate, from, project } = req.query;

    const _page = Number.parseInt(page!.toString()) - 1;

    let query = [];

    if (fromDate)
      query.push({
        createdAt: {
          $gte: dayjs(fromDate as string)
            .tz("Asia/Manila")
            .startOf("day")
            .toDate(),
        },
      });
    if (toDate)
      query.push({
        createdAt: {
          ...(!fromDate
            ? {
                $gte: dayjs(toDate as string)
                  .tz("Asia/Manila")
                  .startOf("day")
                  .toDate(),
              }
            : {}),
          $lte: dayjs(toDate as string)
            .tz("Asia/Manila")
            .endOf("day")
            .toDate(),
        },
      });

    if (from) query.push({ userId: new mongoose.Types.ObjectId(from as any) });

    const total = await Notification.countDocuments(
      query.length > 0 ? { $and: query } : {}
    );

    if (project) project = JSON.parse(project as string);

    return await Notification.find(
      query.length > 0 ? { $and: query } : {},
      project
    )
      .skip(_page * Number.parseInt(pageSize!.toString()))
      .limit(Number.parseInt(pageSize!.toString()))
      .populate("from")
      .then((e: any[]) => {
        return res.json({
          code: 200,
          success: true,
          message: "Successfully fetched",
          data: e,
          meta: {
            total,
          },
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
  } else {
    return await Notification.create(req.body)
      .then(async () => {
        await new Pusher2().emit("admin", "notify", {});
        return res.json({ code: 200, success: true });
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
}

export default ApiMiddleware(handler);
