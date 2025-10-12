import { app } from "./app.js"
import { env } from "./config/env.js";
import { schedulerService } from "./container.js";

const PORT = env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);

    schedulerService.start();
});

