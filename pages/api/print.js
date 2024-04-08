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
    interface: "printer:velayo_printer",
  });

  // printer.alignCenter();
  // printer.println("Hello world");
  let a = await printer.isPrinterConnected();
  console.log(a);
  printer.print("Hi Love, I love you");
  printer.cut();

  // try {
  //   let execute = await printer.execute();
  //   console.log(execute);
  //   console.log("Print done!");
  // } catch (error) {
  //   console.error("Print failed:", error);
  // }

  res.json({ code: 200, success: true });
}

export default handler;
