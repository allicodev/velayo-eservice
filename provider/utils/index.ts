import Settings from "@/database/models/settings.schema";
import Branch from "@/database/models/branch.schema";
import Log from "@/database/models/log.schema";
import dayjs from "dayjs";
import { NextApiResponse } from "next";
import { ExtendedResponse, Response } from "@/types";

const queueResetter = async () => {
  // if exist
  let queueSettings = await Settings.findOne({ _id: "queue_settings" });

  if (queueSettings) {
    return await Settings.findOneAndUpdate(
      { _id: "queue_settings" },
      { $set: { "queue.$[].queue": 0 } }
    );
  } else {
    // get all branches
    let branches = await Branch.find().select("_id");
    return await Settings.create({
      _id: "queue_settings",
      queue: branches.map((e) => ({ id: e._id.toString(), queue: 0 })),
    });
  }
};

const creditInterestChecker = async () => {
  let creditsLogs = await Log.find({ type: "credit", status: "pending" });
  for (let i = 0; i < creditsLogs.length; i++) {
    let log = creditsLogs[i];

    if (dayjs(log.dueDate).isBefore(dayjs())) {
      let baseAmount = log.amount;
      let interest = log.interest / 100;

      await Log.findOneAndUpdate(
        { _id: log._id },
        {
          $push: {
            history: {
              amount: (baseAmount * interest).toFixed(2),
              date: new Date(),
              description: "Interest",
            },
          },
        }
      );
    }
  }
};

const processCreditPayment = async (body: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      let amount = body.amount;

      let logs = await Log.find({
        type: "credit",
        status: "pending",
        userCreditId: body.userCreditId,
      }).sort({ dueDate: 1 });

      for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        const logAmountWithInterest = log.history.reduce(
          (p: any, n: any) => p + parseFloat(n.amount),
          0
        );

        if (amount >= logAmountWithInterest) {
          amount -= logAmountWithInterest;
          await await Log.findOneAndUpdate(
            { _id: log._id },
            {
              $push: {
                history: {
                  amount: -logAmountWithInterest.toFixed(2),
                  date: new Date(),
                  description: "Payment Received",
                },
              },
              $set: {
                status: "completed",
              },
            }
          );
        } else {
          await await Log.findOneAndUpdate(
            { _id: log._id },
            {
              $push: {
                history: {
                  amount: -amount.toFixed(2),
                  date: new Date(),
                  description: "Payment Received",
                },
              },
            }
          );
          break;
        }
      }

      resolve({
        code: 200,
        success: true,
        message: "Success",
      });
    } catch (e) {
      reject({
        code: 500,
        success: false,
        message: "There is an error in the Server.",
      });
    }
  });
};

const resetBranchInitialBalance = async () => {
  return await Branch.updateMany(
    {},
    {
      $set: {
        balance: 0,
      },
    }
  );
};

const attendancePhotoResetter = async (
  res: NextApiResponse<ExtendedResponse<Response>>
) => {
  const currentDate: Date = new Date();
  const pastDate: Date = new Date(
    currentDate.setDate(currentDate.getDate() - 15)
  );

  return await Log.find(
    {
      type: "attendance",
      createdAt: { $lte: pastDate },
    },
    { _id: 1 }
  )
    .select("_id")
    .then(async (e) => {
      await Log.updateMany(
        { _id: { $in: e.map((_) => _._id.toString()) } },
        { $set: { "flexiTime.$[].photo": null } }
      );
      return res.json({
        code: 200,
        success: true,
        data: e as any,
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
};

export {
  queueResetter,
  creditInterestChecker,
  processCreditPayment,
  resetBranchInitialBalance,
  attendancePhotoResetter,
};
