import express from "express";
import cors from 'cors';
import { router } from "./routes.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());
app.use('/api', router);

app.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`));

