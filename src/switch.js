import { Pipe } from '@gamedevfox/katana';

import { ListCollector } from './collector';

export const Switch = () => {
  const system = {};

  let count = 0;
  const outputs = {};
  const conditions = {};
  const conditionIdMap = {};

  const [fireDefault, onDefault] = Pipe();

  const getConditionId = ({ input: outputId, onOutput }) => onOutput(conditionIdMap[outputId]);

  const input = value => {
    const outputIds = Object.keys(conditionIdMap);
    let found = false;

    const collect = ListCollector();
    outputIds.forEach(outputId => {
      const condC = collect();

      const conditionId = conditionIdMap[outputId];
      const condition = conditions[conditionId];

      condition({ input: value, onOutput: result => {
        if(result) {
          found = true;
          const output = outputs[outputId];
          output(value);
        }

        condC();
      } });
    });

    collect.done(() => {
      if(!found)
        fireDefault(value);
    });
  };

  const open = ({ onOutput }) => {
    const id = ++count;
    const outputId = `onOutput${id}`;
    const conditionId = `onCondition${id}`;

    conditionIdMap[outputId] = conditionId;

    const [output, onOut] = Pipe();
    const [condition, onCondition] = Pipe();

    outputs[outputId] = output;
    conditions[conditionId] = condition;

    system[outputId] = onOut;
    system[conditionId] = onCondition;

    onOutput(outputId);
  };

  system.input = input;
  system.open = open;
  system.getConditionId = getConditionId;
  system.onDefault = onDefault;

  return system;
};
