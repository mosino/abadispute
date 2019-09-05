const { Map, Set, List } = require('immutable');

// recursive call
const fCompute = (filters, updt, implementation, framework, t) => n => {
    if (n > t.step && !t.get('aborted') && !t.get('success')) {
        if (t.get('children').size == 0) {
            t = fAlgorithmStep(filters, updt, implementation, framework, t);
        }
        
        t.set(
            'children', 
            t.get('children').map(
                tChild => fCompute(filters, updt, implementation, framework, tChild)(n)
            )
        );
    }

    return t;
};

// as described in X-dispute-derivations
const fAlgorithmStep = (f, updt, i, fw, t) => {
    let success = false;    //@todo
    let aborted = false;    //@todo

    if (success) t = t.set('success', true);
    if (aborted) t = t.set('aborted', true);
    if (success || aborted) return t;

    let turn = i.turn(P, O, F);
    let P = t.get('P');
    let O = t.get('O');
    let D = t.get('D');
    let C = t.get('C');
    let F = t.get('F');
    let A = Set(fw.get('assumptions'));
    let R = Set(fw.get('rules'));
    // not::function - allow for functional or list of contraries
    let not = (typeof(fw.get('contraries')) == 'function') ?
        fw.get('contraries') :
        (a => fw.get('contraries')[a]);
    

    if (turn == 'P') {  // 1
        let sigma = i.sel(P);

        if (A.includes(sigma)) {    // 1.i
            let tChild = fTConstructor()
                .set('P', P.delete(sigma))
                .set('O', O.add(fArgumentConstructor(not(sigma))))
                .set('D', D)
                .set('C', C)
                .set('F', F);

            t.set('children', Set([tChild]));
        } else {    // 1.ii
            let ruleExists = false;

            R.map(
                rule => {
                    if (rule.head == sigma) {
                        let body = Set(rule.b);

                        ruleExists = true;

                        if (f.fDbyC(body, C)) {
                            let tChild = fTConstructor()
                                .set('P', P.delete(sigma).union(f.fDbyD(body, D)))
                                .set('D', D.union(A.intersect(body)))
                                .set('C', C)
                                .set('O', O)
                                .set('F', F);

                            t.set('children', t.get('children').add(tChild));
                        }
                    }
                }
            );

            if (!ruleExists) {
                t.set('aborted', true);
            }
        }
    } else if(turn == 'O') {    // 2
        let S = i.memberO(O);
        let sigma = i.sel(fGetUnmarked(S));

        if (A.includes(sigma)) {    // 2.i
            // 2.i.a
            let tChildA = fTConstructor()
                .set('O', O.delete(S).add(fMark(S, sigma)))
                .set('P', P)
                .set('D', D)
                .set('C', C)
                .set('F', F);
            
            t.set('children', t.get('children').add(tChildA));

            if (f.fCbyD(sigma, D)) {
                if (f.fCbyC(Set([sigma]), C)) {   // 2.i.b
                    let tChildB = fTConstructor()
                        .set('O', O.delete(S))
                        .set('F', updt(F, fUnmarkAll(S)))
                        .set('P', P)
                        .set('D', D)
                        .set('C', C);
                        
                    t.set('children', t.get('children').add(tChildB));
                } else {    // 2.i.c
                    let tChildC = fTConstructor()
                        .set('O', O.delete(S))
                        .set('C', C.add(sigma))
                        .set('D', D.union(A.intersect(Set([not(sigma)]))))
                        .set('F', updt(F, fUnmarkAll(S)))
                        .set('P', P.add(not(sigma)));
                    
                    t.set('children', t.get('children').add(tChildC));
                }
            }
        } else {    // 2.ii

        }
    } else if(turn == 'F') {    // 3
        // @todo
    } else {
        console.error('"turn" returned an unexpected value');
    }

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
};

const fArgumentConstructor = sentence => 
    Map({
        s: Set([sentence]),
        m: Set()    // marked sentences
    });

// S_u
const fGetUnmarked = argument => argument.get('s').subtract(argument.get('m'));

// m(sigma, S)
const fMark = (argument, sentence) => argument.set('m', argument.get('m').add(sentence));

// u(S)
const fUnmarkAll = argument => argument.set('m', Set());

const fTConstructor = () =>
    Map({
        P: Set(),
        O: Set(),   // Set of Arguments
        D: Set(),
        C: Set(),
        F: Set(),
        step: 0,
        children: Set(),    // Set of Tuples
        aborted: false,
        success: false,
        path: List()
    });

const fGetInitialT = (framework, sentence) =>
    fTConstructor()
        .set('P', Set([sentence]))
        .set('D', Set(framework.assumptions).intersect(Set([sentence])));

// traverse computation tree and return leaves
const fGetBranches = tList => {
    let branches = List();

    tList.map(
        t => {
            if (t.get('children').size == 0) {
                t = branches.add(t);
            } else {
                t = branches.concat(fGetBranches(t.get('children')));
            }
        }
    );

    return branches;
};

// list of all tuples along path in the computation tree
const fGetDerivation = (t, path, partialDerivation) => 
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
                compute: fCompute(filters, updt, implementation, framework, t),
                getBranches: fGetBranches(List([t])),
                getSupport: branch => getBranches().get(branch).get('D'),
                getDerivation: branch => 
                    fGetDerivation(
                        t, 
                        getPath(branch),
                        List()
                    )
            };
    },

    filtersAB: {
        fDbyC: (R, C) => Set.intersect(R, C).size == 0,
        fDbyD: (R, D) => R.subtract(D),
        fCbyD: (s, D) => !D.contains(s),
        fCbyC: (R, C) => Set.intersect(R, C).size != 0,
    },
    
    filtersGB: {
        fDbyC: (R, C) => Set.intersect(R, C).size == 0,
        fDbyD: (R, _D) => R,
        fCbyD: (s, D) => !D.contains(s),
        fCbyC: (_R, _C) => false
    },
    
    filtersIB: {
        fDbyC: (R, C) => this.filtersAB(R, C),
        fDbyD: (R, D) => R.subtract(D),
        fCbyD: (s, D) => !D.contains(s),
        fCbyC: (R, C) => Set.intersect(R, C).size != 0,
    },
    
    updtSimple: (F, _S) => F,
    
    updtIB: (F, S) => {
        return Set.union(F, S);
    }, 
    
    implementationSimple: {
        sel: (S) => S.first(null),
        turn: (P, O, F) => {
            if (P.size != 0) return 'P';
            if (O.size != 0) return 'O';
            if (F.size != 0) return 'F';

            console.error('no valid turn');
            return null;
        },
        memberO: (SS) => SS.first(),
        memberF: (SS) => SS.first()
    }, 
    
    implementationLP: {
        // S::orderedSet
        sel: (S) => S.last(null),
        // eslint-disable-next-line
        turn: (P, O, F) => null,    // @todo: the most recently modified element among P and O
        memberO: (SS) => SS.first(),
        memberF: (SS) => SS.first()
    }
};
