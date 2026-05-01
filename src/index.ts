import "dotenv/config";
import { client } from "./config/client";
import { loadEvents } from "./handlers/eventHandler";
import { loadCommands } from "./handlers/commandHandler";
import { connectDatabase } from "./config/database";
import { loadModals } from "./handlers/modalHandler";
import { loadButtons } from "./handlers/buttonHandler";

(async () => {
    await connectDatabase();
    await loadEvents(client);
    await loadModals(client);
    await loadButtons(client);
    await loadCommands(client.commands);

    await client.login(process.env.TOKEN);
})();