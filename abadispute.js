abadispute = (framework, sentence) => {
    var computationCounter = 0;

    return {
        compute: (n) => {
            while (computationCounter < n) {
                console.log("computationCounter: " + computationCounter);
                computationCounter++;
            }
        },

        getBranches: () => {
            return framework + "|" + sentence + ": the branches";
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