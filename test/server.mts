import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";

const port = 12121;
const path = dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.static(path));

app.listen(port, () => {
  console.log(`Listening on: \x1b[34m\x1b[4mhttp://localhost:${port}/\x1b[0m`);
});
