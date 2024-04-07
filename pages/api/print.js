const ThermalPrinter = require("node-thermal-printer").printer;
const PrinterTypes = require("node-thermal-printer").types;

async function handler(req, res) {
  const { method } = req;

  if (method != "POST")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  let printer = new ThermalPrinter({
    type: PrinterTypes.STAR,
    interface: "bluetooth",
  });

  printer.alignCenter();
  printer.println("Hello world");
  printer.cut();

  try {
    let execute = printer.execute();
    console.log("Print done!");
  } catch (error) {
    console.error("Print failed:", error);
  }

  res.json({ code: 200, success: true });
}

export default handler;
