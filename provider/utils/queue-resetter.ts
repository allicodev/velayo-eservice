import Settings from "@/database/models/settings.schema";
import Branch from "@/database/models/branch.schema";

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

export { queueResetter };
