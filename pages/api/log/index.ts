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
import { processCreditPayment } from "@/provider/utils";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<LogData[]>>
) {
  await dbConnect();

  const { method } = req;

  if (method == "GET") {
    let {
      page,
      pageSize,
      type,
      userId,
      fromDate,
      toDate,
      project,
      balanceType,
      branchId,
      stockType,
      portalId,
      _id,
    } = req.query;

    console.log(req.query);

    const _page = Number.parseInt(page!.toString()) - 1;

    let query = [],
      _logs = [];

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
    if (_id) query.push({ _id: new mongoose.Types.ObjectId(_id as any) });
    if (branchId)
      query.push({ branchId: new mongoose.Types.ObjectId(branchId as any) });
    if (stockType) query.push({ stockType });
    if (portalId) query.push({ portalId });

    if (type) {
      if (Array.isArray(type)) query.push({ type: { $in: type } });
      else query.push({ type });
    }

    if (balanceType) query.push({ balanceType });

    const total = await Log.countDocuments(
      query.length > 0 ? { $and: query } : {}
    );

    if (type == "attendance") {
      _logs = await Log.find(query.length > 0 ? { $and: query } : {}, {
        timeIn: 1,
        timeOut: 1,
        _id: 0,
      });
    }

    if (project) project = JSON.parse(project as string);
    return await Log.find(query.length > 0 ? { $and: query } : {}, project)
      .skip(_page * Number.parseInt(pageSize!.toString()))
      .limit(Number.parseInt(pageSize!.toString()))
      .populate("userId branchId items.itemId")
      .sort({ createdAt: -1 })
      .then((e) => {
        return res.json({
          code: 200,
          success: true,
          message: "Successfully fetched",
          data: e as any,
          meta: {
            total,
            timers: _logs,
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

    if (req.body.type == "credit_payment") await processCreditPayment(req.body);

    if (postType == "new")
      return await Log.create(req.body)
        .then((e) =>
          res.json({
            code: 200,
            success: true,
            data: e,
            message: "Successfully added",
          })
        )
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

export default handler;
