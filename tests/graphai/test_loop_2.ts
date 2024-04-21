import { AgentFunction } from "@/graphai";
import { graphDataTestRunner } from "~/utils/runner";
import { defaultTestAgents } from "~/agents/agents";

import test from "node:test";
import assert from "node:assert";

const graphdata_counter = {
  loop: {
    count: 10,
  },
  nodes: {
    data: {
      value: { v: 0 },
      update: "counter",
    },
    counter: {
      agentId: "counterAgent",
      inputs: ["data"],
    },
  },
};

const counterAgent: AgentFunction = async ({ inputs }) => {
  return { v: (inputs[0].v || 0) + 1 };
};

test("test counter", async () => {
  const result = await graphDataTestRunner(__filename, graphdata_counter, {
    counterAgent,
  });
  assert.deepStrictEqual(result, { data: { v: 9 }, counter: { v: 10 } });
});

test("test counter2", async () => {
  const nested_graphdata = {
    loop: {
      count: 10,
    },
    nodes: {
      workingMemory: {
        value: {},
        update: "nested1", // update data from nested1 data
      },
      nested1: {
        agentId: "nestedAgent",
        params: {
          nodeId: "counter", // nestedAgent result is counter node result in graphdata_counter
          inputNodes: ["data"], // inject workingMemory data to data node in graphdata_counter
          graph: graphdata_counter,
        },
        inputs: ["workingMemory"],
      },
    },
  };

  const result = await graphDataTestRunner(__filename, nested_graphdata, {
    ...defaultTestAgents,
    counterAgent,
  });
  assert.deepStrictEqual(result, { workingMemory: { v: 90 }, nested1: { v: 100 } });
});
