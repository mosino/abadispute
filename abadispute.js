const { Map, Set } = require('immutable');

module.exports = {
    abadispute: (filters, updt, implementation) => 
        (framework, sentence) => {
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
    },

    filtersAB: {
        fDbyC: (R, C) => Set.intersect(R, C).size == 0,
        fDbyD: (R, D) => R.subtract(D),
        fCbyD: (s, D) => !D.contains(s),
        fCbyC: (R, C) => Set.intersect(R, C).size != 0,
    },
    
    filtersGB: {
        fDbyC: (R, C) => Set.intersect(R, C).size == 0,
        fDbyD: (R, D) => R,
        fCbyD: (s, D) => !D.contains(s),
        fCbyC: (R, C) => false
    },
    
    filtersIB: {
        fDbyC: (R, C) => this.filtersAB(R, C),
        fDbyD: (R, D) => R.subtract(D),
        fCbyD: (s, D) => !D.contains(s),
        fCbyC: (R, C) => Set.intersect(R, C).size != 0,
    },
    
    updtSimple: (f, s) => f,
    
    updtIB: (f, s) => {
        return f; // @todo
    }, 
    
    implementationSimple: {
        sel: (S) => S.last(), // @todo
        turn: (P, O, F) => P.last(), // @todo
        memberO: (SS) => SS.first(),
        memberF: (SS) => SS.first()
    }, 
    
    implementationLP: {
        sel: (S) => S.last(), // @todo
        turn: (P, O, F) => P.last(), // @todo
        memberO: (SS) => SS.first(),
        memberF: (SS) => SS.first()
    }
}
