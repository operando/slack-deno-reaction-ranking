import {DefineFunction, Schema, SlackFunction} from "deno-slack-sdk/mod.ts";
import {SlackAPI} from "deno-slack-api/mod.ts"; // Add this
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
    const reactionsCount: { [key: string]: number } = {};
    const client = SlackAPI(SLACK_API_TOKEN);
    const res = await client.reactions.list({
      limit: 1000,
      user: userId
    });
    const length = res.items.length;
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
    const reactionRanking = `<@${userId}>\nあなたのランキングです！（集計数 ${length}件）\n` + array.slice(0, 20).map((item, index) => (index + 1) + '位 :' + item.key + ': ' + item.value + "回").join("\n");
    return {outputs: {reactionRanking}};
  },
);
