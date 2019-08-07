export default class {
    constructor (framework, sentence) {
        this.framework = framework;
        this.sentence = sentence;
        this.computationCounter = 0;
    }

    compute(n) {
        while (this.computationCounter < n) {
            console.log("computationCounter: " + this.computationCounter);
            this.computationCounter++;
        }
    }

    getBranches() {
        return "the branches";
    }

    getSupport(branch) {
        return "the support";
    }

    getDerivation(branch) {
        return "the derivation";
    }
}