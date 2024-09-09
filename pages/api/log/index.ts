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
      month,
      year,
      _id,
      userCreditId,
      fetchTotalTimer,
    } = req.query;
    let _page = 0;
    let _pageSize = 10;

    if (page) _page = Number.parseInt(page!.toString()) - 1;
    if (pageSize) _pageSize = Number.parseInt(pageSize!.toString());

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
    if (userCreditId)
      query.push({
        userCreditId: new mongoose.Types.ObjectId(userCreditId as any),
      });
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
    if (month)
      query.push({
        $expr: {
          $and: [
            { $eq: [{ $month: "$createdAt" }, parseInt(month.toString()) + 1] },
            ...(year ? [{ $eq: [{ $year: "$createdAt" }, year] }] : []),
          ],
        },
      });

    const total = await Log.countDocuments(
      query.length > 0 ? { $and: query } : {}
    );

    if (type == "attendance" && fetchTotalTimer == "true") {
      _logs = await Log.find(query.length > 0 ? { $and: query } : {}, {
        flexiTime: 1,
        _id: 0,
      });
    }

    if (project) project = JSON.parse(project as string);
    return await Log.find(query.length > 0 ? { $and: query } : {}, project)
      .skip(_page * _pageSize)
      .limit(_pageSize)
      .populate({ path: "userId" })
      .populate({ path: "userId" })
      .populate({
        path: "transactionId",
        populate: {
          path: "tellerId",
        },
      })
      .populate({
        path: "items",
        populate: {
          path: "itemId",
        },
      })
      .populate({ path: "branchId", select: "name" })
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

    if (req.body.type == "credit_payment")
      return await processCreditPayment(req.body)
        .then((e: any) => res.json(e))
        .catch((e) => res.json(e));

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
        {
          $set: req.body,
          ...(![null, undefined].includes(req.body.$push)
            ? { $push: req.body.$push }
            : {}),
        }
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
