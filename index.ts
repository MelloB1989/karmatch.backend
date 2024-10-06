import express from "express";
import cors from "cors";

const app = express();
const port = 8084; //7898;

const allowedOrigins = ["http://localhost:3000"];

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
