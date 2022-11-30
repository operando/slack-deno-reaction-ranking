import {DefineFunction, Schema, SlackFunction} from "deno-slack-sdk/mod.ts";
import {SLACK_API_TOKEN} from "../env.ts";

export const ReactionRankingFunctionDefinition = DefineFunction({
  callback_id: "reaction_ranking_function",
  title: "Reactions ranking function",
  description: "Get reactions ranking function",
  source_file: "functions/reaction_ranking_function.ts",
  input_parameters: {
    properties: {
      userId: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["userId"],
  },
  output_parameters: {
    properties: {
      reactionRanking: {
        type: Schema.slack.types.rich_text,
      },
    },
    required: ["reactionRanking"],
  },
});

export default SlackFunction(
  ReactionRankingFunctionDefinition,
  async ({inputs}) => {
    const {userId} = inputs;
    const client = new SlackAPIClient(SLACK_API_TOKEN);
    const reactionsCount: { [key: string]: number } = {};
    const res = await client.apiCall("reactions.list", {"limit": 1000, 'user': userId});
    for (const item of res.items) {
      for (const reactions of (item.type === "message" ? item.message.reactions : item.file.reactions)) {
        if (reactions.users.includes(userId)) {
          if (!(reactions.name in reactionsCount)) {
            reactionsCount[reactions.name] = 0;
          }
          reactionsCount[reactions.name] += 1;
        }

      }
    }
    const array = Object.keys(reactionsCount).map((k) => ({key: k, value: reactionsCount[k]}));
    array.sort((a, b) => b.value - a.value);
    console.log(array.slice(0, 20).map((item, index) => (index + 1) + '位  :' + item.key + ': ' + item.value + "回").join("\n"));
    const reactionRanking = `<@${userId}>\nあなたのランキングです！\n` + array.slice(0, 20).map((item, index) => (index + 1) + '位 :' + item.key + ': ' + item.value + "回").join("\n");
    return {outputs: {reactionRanking}};
  },
);

export class SlackAPIClient {
  #token?: string;
  #baseURL: string;

  constructor(token?: string) {
    this.#token = token;
    this.#baseURL = "https://slack.com/api/";
  }

  async apiCall(
    method: string,
    data: Record<string, unknown>,
  ): Promise<Response> {
    // ensure there's a slash prior to method
    const url = `${this.#baseURL.replace(/\/$/, "")}/${method}`;
    const body = serializeData(data);

    const token = this.#token || "";
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw Error(`${resp.status}: ${text}`);
    }
    return await resp.json();
  }
}

export type Response = {
  ok: boolean;
  error?: string;
  warnings?: string[];
  "response_metadata"?: {
    warnings?: string[];
    messages?: string[];
  };
  [otherOptions: string]: any;
};

export function serializeData(data: Record<string, unknown>): URLSearchParams {
  const encodedData: Record<string, string> = {};
  Object.entries(data).forEach(([key, value]) => {
    // Skip properties with undefined values.
    if (value === undefined) return;

    encodedData[key] = (typeof value !== "string" ? JSON.stringify(value) : value);
  });

  return new URLSearchParams(encodedData);
}
