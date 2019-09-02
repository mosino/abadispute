const { Map, Set } = require('immutable');

module.exports = {
    abadispute: (filters, updt, implementation) => 
        (framework, sentence) => {
            let computationCounter = 0;
            let branches = Map({});

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
    
    updtSimple: (F, S) => F,
    
    updtIB: (F, S) => {
        return Set.union(F, S);
    }, 
    
    implementationSimple: {
        sel: (S) => S.first(null),
        turn: (P, O, F) => {
            if (P.size != 0) return "P";
            if (O.size != 0) return "O";
            if (F.size != 0) return "F";
            console.log("no valid turn");
            return null;
        },
        memberO: (SS) => SS.first(),
        memberF: (SS) => SS.first()
    }, 
    
    implementationLP: {
        // S::orderedSet
        sel: (S) => S.last(null),
        turn: (P, O, F) => null, // @todo: the most recently modified element among P and O
        memberO: (SS) => SS.first(),
        memberF: (SS) => SS.first()
    }
}
