// const ThermalPrinter = require("node-thermal-printer").printer;
// const PrinterTypes = require("node-thermal-printer").types;

var thermal_printer = require("node-thermal-printer");
var printer = require("printer");

var star = printer.getPrinter("STMicroelectronics_POS80_Printer_USB");

thermal_printer.init({
  type: "star",
});

async function handler(req, res) {
  const { method } = req;

  if (method != "POST")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  console.log(printer.getPrinters());

  thermal_printer.print("Hello World");
  thermal_printer.println("Hello World");
  thermal_printer.println("Before partial cut...");
  thermal_printer.partialCut();
  thermal_printer.println("After partial cut...");
  thermal_printer.cut();
  thermal_printer.print("Hello World");
  thermal_printer.println("Hello World");
  thermal_printer.println("Before partial cut...");
  thermal_printer.partialCut();
  thermal_printer.println("After partial cut...");
  thermal_printer.drawLine();

  console.log(thermal_printer.getBuffer());

  printer.printDirect({
    data: thermal_printer.getBuffer(),
    printer: star.name,
    type: "TEXT",
    success: function (job_id) {
      console.log("OK :" + job_id);
    },
    error: function (err) {
      console.error(err);
    },
  });

  // let printer = new ThermalPrinter({
  //   type: PrinterTypes.STAR,
  //   interface: "printer:velayo_printer",
  // });

  // // printer.alignCenter();
  // // printer.println("Hello world");
  // let a = await printer.isPrinterConnected();
  // console.log(a);
  // printer.print("Hi Love, I love you");
  // printer.cut();

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
