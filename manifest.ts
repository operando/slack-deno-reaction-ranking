import {Manifest} from "deno-slack-sdk/mod.ts";
import Workflow from "./workflows/workflow.ts";

export default Manifest({
  name: "reaction ranking",
  description: "reaction ranking bot",
  icon: "assets/icon.png",
  workflows: [Workflow],
  outgoingDomains: [],
  botScopes: ["chat:write", "chat:write.public", "app_mentions:read"],
});
