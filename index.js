const express = require("express");
const exphbs = require("express-handlebars");
const multer = require("multer");
const { simpleParser } = require("mailparser");
const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime); // Extend dayjs with relativeTime plugin
const app = express();
const port = 3000;

// Configure Handlebars
app.engine("hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views")); // Middleware
app.use(express.static(path.join(__dirname, "public")));

// Multer for file uploads
const upload = multer({ dest: "uploads/" });

// Routes
app.get("/", (req, res) => {
  res.render("upload");
});

app.post("/upload", upload.single("emlFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const filePath = path.join(__dirname, req.file.path);
    const emlContent = fs.readFileSync(filePath, "utf-8");
    const parsed = await simpleParser(emlContent);
    fs.unlinkSync(filePath); // Delete uploaded file after parsing

    const sentTime = parsed.date
      ? dayjs(parsed.date).fromNow(true)
      : "1 minute";

    console.log(sentTime);
    res.render("parsed", {
      emailHtml: parsed.html || "No HTML content found",
      sentAgo: `${sentTime} ago`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error processing the file.");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
