const { Map, Set } = require('immutable');

fCompute = (filters, updt, implementation, t) => n => {
    if (n > t.step && !t.get('aborted') && !t.get('success')) {
        if (t.get('children').size == 0) {
            t = fAlgorithmStep(filters, updt, implementation, t);
        }
        
        t.set(
            'children', 
            t.get('children').map(
                tChild => fCompute(filters, updt, implementation, tChild)(n)
            )
        );
    }

    return t;
}

fAlgorithmStep = (filters, updt, implementation, t) => {
    let success = false; //@todo
    let aborted = false; //@todo

    if (success) t = t.set('success', true);
    if (aborted) t = t.set('aborted', true);
    if (success || aborted) return t;
    
    //...

    t.set(
        'children', 
        t.get('children').map(
            tChild => 
                tChild
                    .set('step', t.step + 1)
                    .set('children', Set([]))
                    .set('aborted', false)
                    .set('success', false)
        )
    );

    return t;
}

fGetInitialT = (framework, sentence) => 
    Map({
        P: Set([sentence]),
        O: Set(), // Set of Sets
        D: Set(framework.assumptions).intersect(Set([sentence])),
        C: Set(),
        F: Set(),
        step: 0,
        children: Set(), // Set of Tuples
        aborted: false,
        success: false,
        path: List()
    });

fGetBranches = tList => {
    let branches = List();

    tList.map(
        t => {
            if (t.get('children').size = 0) {
                t = branches.add(t);
            } else {
                t = branches.concat(fGetBranches(t.get('children')));
            }
        }
    );

    return branches;
}

fGetDerivation = (t, path, partialDerivation) => 
    (path.size == 0) ?
        partialDerivation.add(t) :
        fGetDerivation(
            t.getIn('children', path.first()), 
            path.shift(),
            partialDerivation.add(t)
        );

module.exports = {
    abadispute: (filters, updt, implementation) => 
        (framework, sentence) => {
            let t = fGetInitialT(framework, sentence);

            let getBranches = () => fGetBranches(List([t]));
            let getPath = branch => getBranches().get(branch).get('path');

            return {
                compute: fCompute(filters, updt, implementation, t),
                getBranches: fGetBranches(List([t])),
                getSupport: branch => getBranches().get(branch).get('D'),
                getDerivation: branch => 
                    fGetDerivation(
                        t, 
                        getPath(branch),
                        List()
                    )
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
