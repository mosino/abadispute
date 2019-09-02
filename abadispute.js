const { Map } = require('immutable');

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
        fDbyC: (R, C) => true, // @todo
        fDbyD: (R, D) => R,
        fCbyD: (s, D) => true, // @todo
        fCbyC: (R, C) => false
    },
    
    filtersGB: {
        fDbyC: (R, C) => true, // @todo
        fDbyD: (R, D) => R, // @todo
        fCbyD: (s, D) => true, // @todo
        fCbyC: (R, C) => false
    },
    
    filtersIB: {
        fDbyC: (R, C) => true, // @todo
        fDbyD: (R, D) => R, // @todo
        fCbyD: (s, D) => true, // @todo
        fCbyC: (R, C) => false // @todo
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
