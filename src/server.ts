import express from "express";
import cors from 'cors';
import { router } from "./routes.js";
import { errorHandler } from "./middlewares/error-handler.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());
app.use('/api', router);
app.use(errorHandler);

app.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`));

