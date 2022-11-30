import {DefineWorkflow, Schema} from "deno-slack-sdk/mod.ts";
import {ReactionRankingFunctionDefinition} from "../functions/reaction_ranking_function.ts";
import SchemaTypes from "deno-slack-sdk/schema/schema_types.ts";

export const Workflow = DefineWorkflow({
  callback_id: "reaction_ranking",
  title: "Reaction Ranking Workflow",
  input_parameters: {
    properties: {
      userId: {
        type: Schema.slack.types.user_id,
      },
      channelId: {
        type: Schema.slack.types.channel_id,
      },
      threadTs: {
        type: SchemaTypes.string,
      },
    },
    required: ["userId", "channelId", "threadTs"],
  },
});

Workflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: Workflow.inputs.channelId,
  // thread_ts: Workflow.inputs.threadTs, // TODO send thread
  message: "集計中です。しばらくお待ちください！",
});

const getReactionsListFunctionDefinition = Workflow.addStep(
  ReactionRankingFunctionDefinition,
  {
    userId: Workflow.inputs.userId,
  },
);

Workflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: Workflow.inputs.channelId,
  message: getReactionsListFunctionDefinition.outputs.reactionRanking,
});

export default Workflow;
