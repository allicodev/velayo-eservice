import { ApiMiddleware } from "@/assets/ts";
import dbConnect from "@/database/dbConnect";
import Portal from "@/database/models/portal.schema";
import Log from "@/database/models/log.schema";
import { ExtendedResponse } from "@/types";

import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<any>>
) {
  await dbConnect();

  const { method } = req;

  if (method == "GET") {
    // todo: filter add here, [assign to,name]
    let { assignTo, project } = req.query;

    if (assignTo) assignTo = JSON.parse(assignTo as string);
    if (project) project = JSON.parse(project as string);

    return await Portal.aggregate([
      ...(assignTo
        ? [
            {
              $match: {
                assignTo: {
                  $in: assignTo,
                },
              },
            },
          ]
        : []),
      {
        $lookup: {
          from: "logs",
          localField: "_id",
          foreignField: "portalId",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userId",
              },
            },
            {
              $unwind: { path: "$userId", preserveNullAndEmptyArrays: true },
            },
          ],
          as: "logs",
        },
      },
      {
        $lookup: {
          from: "requests",
          localField: "_id",
          foreignField: "portalId",
          pipeline: [
            {
              $match: {
                status: "pending",
              },
            },
          ],
          as: "requests",
        },
      },
      {
        $addFields: {
          currentBalance: {
            $reduce: {
              input: "$logs",
              initialValue: 0,
              in: {
                $add: [
                  "$$value",
                  "$$this.amount",
                  { $ifNull: ["$$this.rebate", 0] },
                ],
              },
            },
          },
        },
      },
      ...(req.query?.sort
        ? ([
            {
              $sort: {
                currentBalance: Number.parseInt(req.query.sort.toString()),
              },
            },
          ] as any[])
        : []),
      ...(project
        ? [
            {
              $project: project,
            },
          ]
        : []),
    ]).then((e) => {
      return res.json({ code: 200, success: true, data: e });
    });
  } else {
    let { _id } = req.body;

    if (_id) {
      return await Portal.findOneAndUpdate({ _id }, { $set: req.body })
        .then((e) =>
          res.json({
            code: 200,
            success: true,
            message: "Successfully Updated",
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
    } else {
      return await Portal.create(req.body).then((e) =>
        res.json({ success: true, code: 200, message: "Successfully Created" })
      );
    }
  }
}

export default ApiMiddleware(handler);
