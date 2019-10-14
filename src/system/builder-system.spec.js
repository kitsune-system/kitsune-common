import { noOp } from '@gamedevfox/katana';
import { Collector } from '../collector';
import { BuilderSystem } from './builder-core';

const config = {
  INTRODUCTION: {
    fn: () => (name, output) => output([`I'm ${name}`]),
  },
  ADAM: {
    fn: ({ eve, intro }) => (introduceSpouse, output = noOp) => {
      intro('Adam', message => {
        if(introduceSpouse) {
          message.push('And this is my wife...');
          eve(false, spouseMsg => output([...message, ...spouseMsg]));
        } else
          output(message);
      });
    },
    bind: { eve: 'EVE', intro: 'INTRODUCTION' },
  },
  EVE: {
    fn: ({ adam, intro }) => (introduceSpouse, output = noOp) => {
      intro('Eve', message => {
        if(introduceSpouse) {
          message.push('And this is my husband...');
          adam(false, spouseMsg => output([...message, ...spouseMsg]));
        } else
          output(message);
      });
    },
    bind: { adam: 'ADAM', intro: 'INTRODUCTION' },
  },
};

describe('BuilderSystem', () => {
  it('should be able to handle circular dependancies', () => {
    const collect = Collector();

    const core = BuilderSystem(config);

    core('ADAM', adam => adam(true, collect('adam')));
    core('EVE', eve => eve(true, collect('eve')));

    collect(result => {
      result.should.deep.equal({
        adam: [
          'I\'m Adam',
          'And this is my wife...',
          'I\'m Eve',
        ],
        eve: [
          'I\'m Eve',
          'And this is my husband...',
          'I\'m Adam',
        ],
      });
    });
  });

  it('should be able to detect circular dependancies is the dependancy is called too soon', () => {
    const collect = Collector();

    const core = BuilderSystem({
      ...config,
      EVE: {
        fn: ({ adam, intro }) => {
          adam(false, msg => console.log('This won\'t be logged...', msg));

          return (introduceSpouse, output = noOp) => {
            intro('Eve', message => {
              if(introduceSpouse) {
                message.push('And this is my husband...');
                adam(false, spouseMsg => output([...message, ...spouseMsg]));
              } else
                output(message);
            });
          };
        },
        bind: { adam: 'ADAM', intro: 'INTRODUCTION' },
      },
    });

    (() => {
      core('ADAM', adam => adam(true, collect('adam')));
    }).should.throw(
      'Circular dependancy detected. To resolve this, wait to call the ' +
      'dependant system after parent function is built: ADAM -> EVE -> ADAM'
    );
  });
});
