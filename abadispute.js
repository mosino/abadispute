const { Map } = require('immutable');

abadispute = (framework, sentence) => {
    var computationCounter = 0;
    var branches = Map({});

    return {
        compute: (n) => {
            while (computationCounter < n) {
                console.log("computationCounter: " + computationCounter);
                computationCounter++;
            }

            if (branches.size == 0) {
                branches = branches.set(0, "first branch");
            }
        },

        getBranches: () => {
            return branches;
        },

        getSupport: (branch) => {
            return framework + "|" + sentence + "|" + branch + ": the support";
        },

        getDerivation: (branch) => {
            return framework + "|" + sentence + "|" + branch + ": the derivation";
        }
    }
}

module.exports = abadispute;