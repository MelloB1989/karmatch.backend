import express from "express";
import cors from "cors";
import Auth from "./routes/auth";
import AI from "./routes/ai";

const app = express();
const port = 6969; //7898;

const allowedOrigins = [
  "http://localhost:3000",
  "https://karmatch-expo.avidia.site",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/v1/health", (req, res) => {
  res.status(200).json({ health: "ok" });
});
app.use("/v1/auth", Auth);
app.use("/v1/ai", AI);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
