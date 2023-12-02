const dotenv = require("dotenv").config();
const http = require("http");
const { readFileSync, writeFileSync } = require("fs");
const homePage = readFileSync("./index.html");
let devsJSON = readFileSync("./data.json");
let devsObj = JSON.parse(devsJSON);

const port = process.env.SERVER_PORT || 4080;
const hostName = process.env.SERVER_HOSTNAME || "127.0.0.2";

const server = http.createServer((req, res) => {
  // id extract
  const reqId = Number(req.url.split("/")[2]);

  // route match
  const reqRoute = /[/devs/][0-9]/.test(req.url);

  // home routes
  if (req.url === "/" && req.method == "GET") {
    res.writeHead(200, { "Content-type": "text/html" });
    res.write(homePage);
    res.statusCode = 200;
    res.end();
  }

  //Get all data
  else if (req.url == "/devs" && req.method == "GET") {
    res.writeHead(200, { "Content-type": "text/json" });
    res.write(devsJSON);
    res.end();
  }

  //Get Single data
  else if (reqRoute && req.method == "GET") {
    if (devsObj.some((data) => data.id == reqId)) {
      const data = devsObj.find((data) => data.id == reqId);
      res.writeHead(200, { "Content-type": "text/json" });
      res.write(JSON.stringify(data));
      res.end("");
    } else {
      res.writeHead(200, { "Content-type": "text/json" });
      res.write(
        JSON.stringify({
          message: "no data found",
        })
      );
      res.end();
    }
  }

  // Add new data
  else if (req.url == "/devs" && req.method == "POST") {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk.toString();
      devsObj.push(JSON.parse(data));
      writeFileSync("./data.json", JSON.stringify(devsObj));
    });
    res.writeHead(200, { "Content-type": "text/json" });
    res.write(JSON.stringify(devsObj));
    res.end("");
  }

  // Delete single data
  else if (reqRoute && req.method == "DELETE") {
    if (devsObj.some((data) => data.id == reqId)) {
      devsObj = devsObj.filter((data) => data.id != reqId);
      writeFileSync("./data.json", JSON.stringify(devsObj));
      res.writeHead(200, { "Content-type": "text/json" });
      res.write(
        JSON.stringify({
          message: "successfully deleted",
        })
      );
      res.end("");
    } else {
      res.writeHead(200, { "Content-type": "text/json" });
      res.write(
        JSON.stringify({
          message: "no devs found",
        })
      );
      res.end();
    }
  }

  //Update single data
  else if ((reqRoute && req.method == "PUT") || req.method == "PATCH") {
    if (devsObj.some((data) => data.id == reqId)) {
      const index = devsObj.findIndex((data) => data.id == reqId);
      let data = {};
      req.on("data", (chunk) => {
        data = chunk.toString();
      });
      req.on("end", () => {
        devsObj[index] = {
          id: devsObj[index].id,
          ...JSON.parse(data),
        };
        writeFileSync("./data.json", JSON.stringify(devsObj));
      });
      res.writeHead(200, { "Content-type": "text/json" });
      res.write(
        JSON.stringify({
          message: "successfully updated",
        })
      );
      res.end("");
    } else {
      res.writeHead(200, { "Content-type": "text/json" });
      res.write(
        JSON.stringify({
          message: "no devs found",
        })
      );
      res.end();
    }
  }

  // Error routes
  else {
    res.writeHead(200, { "Content-type": "text/json" });
    res.write(
      JSON.stringify({
        message: "Wrong Route",
      })
    );

    res.end("");
  }
});

// server listen
server.listen(port, () => {
  console.log(
    `server is running on http://localhost:${port}  or  http://${hostName}:${port}`
  );
});
