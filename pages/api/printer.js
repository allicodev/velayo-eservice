var { spawn } = require("node:child_process");
// TODO: return the pid to client so we can save it locally

const command =
  "source /Users/cuteprogrammer/.nvm/nvm.sh && nvm use 13 && cd printer-server && node server";
let childProcess;

const startProxyServer = () => {
  return new Promise((resolve, reject) => {
    childProcess = spawn("sh", ["-c", command], { detached: true });
    childProcess.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
      if (typeof data == "object" && data.toString().startsWith("Express")) {
        const _childProcess = spawn(
          "sh",
          ["-c", "lsof -i :3001 | grep LISTEN | awk '{print $2}'"],
          { detached: true }
        );
        _childProcess.stdout.on("data", (data) => {
          return resolve({
            message: "Successfully Started the proxy server",
            pid: data.toString().replace(/[\D\s]/g, ""),
          });
        });
      }
    });

    childProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
      return reject(data.toString());
    });

    childProcess.on("close", (code) => {
      if (code === 0) {
        console.log("Command executed successfully");
      } else {
        console.error(`Command failed with exit code ${code}`);
      }
    });
  });
};

const endProxyServer = (pid) => {
  return new Promise((resolve, reject) => {
    if (childProcess && !childProcess.killed) {
      childProcess.kill();
      childProcess = null;
      process.kill(-pid);
      process.kill(pid);
      return resolve({
        message: "Proxy Server stopped successfully",
      });
    }
    // process.kill(-pid);
    process.kill(pid);
    resolve("Already killed");
  });
};

async function handler(req, res) {
  const { method } = req;

  if (method != "GET")
    res.json({
      code: 405,
      success: false,
      message: "Incorrect Request Method",
    });

  const { mode, pid } = req.query;

  if (mode == "connect")
    return await startProxyServer()
      .then((e) =>
        res.json({
          code: 200,
          success: true,
          message: e.message,
          ...(e?.pid ?? false ? { pid: e.pid } : {}),
        })
      )
      .catch((e) =>
        res.json({
          code: 500,
          success: false,
          message: e.message,
        })
      );
  else
    return await endProxyServer(pid)
      .then((e) => res.json({ code: 200, success: true, message: e }))
      .catch((e) =>
        res.json({
          code: 500,
          success: false,
          message: e.message,
        })
      );
}

export default handler;
