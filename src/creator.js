import { Pipe } from './pipe';

export const Creator = () => {
  const [createSystem, onCreateSystem] = Pipe();
  const [createId, onCreateId] = Pipe();
  const [output, onOutput] = Pipe();

  const build = ({ input: systemId, onOutput }) => {
    createSystem({ input: systemId, onOutput: sysInst => {
      createId({ onOutput: id => {
        output({ id, system: sysInst });
        onOutput(id);
      } });
    } });
  };

  return {
    build,
    onOutput,

    onCreateSystem, onCreateId,
  };
};
