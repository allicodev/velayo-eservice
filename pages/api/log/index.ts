import { ApiMiddleware } from "@/assets/ts";
import dbConnect from "@/database/dbConnect";
import Log from "@/database/models/log.schema";
import { ExtendedResponse, LogData } from "@/types";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<LogData[]>>
) {
  await dbConnect();

  const { method } = req;

  if (method == "GET") {
    let { page, pageSize, type, userId, fromDate, toDate, project } = req.query;

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

    if (userId)
      query.push({ userId: new mongoose.Types.ObjectId(userId as any) });

    if (type) query.push({ type });

    const total = await Log.countDocuments(
      query.length > 0 ? { $and: query } : {}
    );

    if (project) project = JSON.parse(project as string);

    return await Log.find(query.length > 0 ? { $and: query } : {}, project)
      .skip(_page * Number.parseInt(pageSize!.toString()))
      .limit(Number.parseInt(pageSize!.toString()))
      .populate("userId branchId")
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
    let { postType } = req.body;

    if (postType == "new")
      return await Log.create(req.body)
        .then(() => res.json({ code: 200, success: true }))
        .catch((e) => {
          console.log(e);
          return res.json({
            code: 500,
            success: false,
            message: "There is an error in the Server.",
          });
        });
    else {
      return await Log.findOneAndUpdate(
        { _id: req.body._id },
        { $set: req.body }
      )
        .then(() => res.json({ code: 200, success: true }))
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
}

export default ApiMiddleware(handler);
