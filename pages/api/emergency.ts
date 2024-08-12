import { NextApiRequest, NextApiResponse } from "next";

import Log from "@/database/models/log.schema";
import { ExtendedResponse, Response } from "@/types";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ExtendedResponse<Response>>
) {
  const attendance = await Log.find({ type: "attendance" }).lean();

  try {
    for (const doc of attendance) {
      // Create the base structure for flexTime
      const flexTimeArray = [
        {
          type: "time-in", // Entry for time-in
          time: doc.timeIn,
          timeInPhoto: doc.timeInPhoto,
        },
      ];

      // Conditionally add time-out entry if it exists
      if (doc.timeOut) {
        flexTimeArray.push({
          type: "time-out", // Entry for time-out
          time: doc.timeOut,
          timeInPhoto: doc.timeOutPhoto,
        });
      }

      //   Update the document in place
      await Log.updateOne(
        { _id: doc._id },
        { $set: { flexiTime: flexTimeArray } }
      );
    }
  } catch (e) {
    console.log(e);
  }

  return res.json({
    code: 200,
    success: true,
  });
}

export default handler;
