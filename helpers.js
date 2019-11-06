const { Set, Map } = require('immutable');

const fDeleteFromArgument = (argument, sentence) =>
    Map({
        s: argument.get('s').delete(sentence),
        m: argument.get('m').delete(sentence)
    });

const fArgumentAddSentences = (argument, sentences) =>
    argument.set('s', argument.get('s').union(sentences));

module.exports = {
    step2iiComputeO: (O, R, S, C, sigma, fCbyC) => {
        let newO = O.delete(S);

        R.map(rule => {
            if (rule.h == sigma) {
                if (!fCbyC(Set(rule.b), C)) {
                    newO = newO.add(
                        fArgumentAddSentences(
                            fDeleteFromArgument(S, sigma),
                            Set(rule.b)
                        )
                    );
                }
            }
        });

        return newO;
    },

    step2iiComputeUpdateFWith: (R, S, C, sigma, fCbyC) => {
        let updateFWith = Set();

        R.map(rule => {
            if (rule.h == sigma) {
                if (fCbyC(Set(rule.b), C)) {
                    updateFWith = updateFWith.union(
                        S.get('s')
                            .delete(sigma)
                            .union(Set(rule.b))
                    );
                }
            }
        });

        return updateFWith;
    }
};
