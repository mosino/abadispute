const { Map, Set, OrderedSet, List } = require('immutable');

const h = require('./helpers');
const fail = require('./fail');

// recursive call
const fCompute = (filters, updt, implementation, framework, t) => n => {
    if (n >= t.get('step')) {
        if (t.get('children').isEmpty()) {
            t = fAlgorithmStep(filters, updt, implementation, framework, t);
        }
        
        t = t.set(
            'children', 
            t.get('children').map(
                tChild => fCompute(filters, updt, implementation, framework, tChild)(n)
            )
        );
    }

    return t;
};

// X-dispute derivations
const fAlgorithmStep = (f, updt, i, fw, t) => {
    if (t.get('aborted') || t.get('success')) return t;

    let P = t.get('P');
    let O = t.get('O');
    let D = t.get('D');
    let C = t.get('C');
    let F = t.get('F');
    let A = Set(fw.assumptions);
    let R = Set(fw.rules);
    let turn = i.turn(P, O, F, t.get('recentPO'));
    // not::function - allow for function or array of contraries
    let not = (typeof(fw.contraries) == 'function') ?
        fw.contraries :
        (a => fw.contraries[a]);
    
    if (turn == 'P') {  // 1
        let sigma = i.sel(P);

        if (A.includes(sigma)) {    // 1.i
            let newP = P.delete(sigma);
            let newO = O.add(fArgumentConstructor(not(sigma)));

            let tChild = fTConstructor()
                .set('P', newP)
                .set('O', newO)
                .set('D', D)
                .set('C', C)
                .set('F', F)
                .set('recentPO', 'O')
                .set('step', t.get('step') + 1)
                .set('aborted', false)
                .set('success', newP.isEmpty() && newO.isEmpty() && F.isEmpty())
                .set('path', t.get('path').push(t.get('children').size))
                .set('by', '1.i');

            t = t.set('children', t.get('children').push(tChild));
        } else {    // 1.ii
            let ruleExists = false;

            R.forEach(
                rule => {
                    if (rule.h == sigma) {
                        let body = Set(rule.b);

                        if (f.fDbyC(body, C)) {
                            ruleExists = true;

                            let newP = P.delete(sigma).union(f.fDbyD(body, D));

                            let tChild = fTConstructor()
                                .set('P', newP)
                                .set('D', D.union(A.intersect(body)))
                                .set('C', C)
                                .set('O', O)
                                .set('F', F)
                                .set('recentPO', 'P')
                                .set('step', t.get('step') + 1)
                                .set('aborted', false)
                                .set('success', newP.isEmpty() && O.isEmpty() && F.isEmpty())
                                .set('path', t.get('path').push(t.get('children').size))
                                .set('by', '1.ii');

                            t = t.set('children', t.get('children').push(tChild));
                        }
                    }
                }
            );

            if (!ruleExists) {
                t = t.set('aborted', true);
            }
        }
    } else if (turn == 'O') {    // 2
        let S = i.memberO(O);
        let sigma = i.sel(fGetUnmarked(S));

        if (sigma === null) {
            t = t.set('aborted', true);
        } else if (A.includes(sigma)) {    // 2.i
            // 2.i.a
            let newOA = O.delete(S).add(fMark(S, sigma));

            let tChildA = fTConstructor()
                .set('O', newOA)
                .set('P', P)
                .set('D', D)
                .set('C', C)
                .set('F', F)
                .set('recentPO', 'O')
                .set('step', t.get('step') + 1)
                .set('aborted', false)
                .set('success', P.isEmpty() && newOA.isEmpty() && F.isEmpty())
                .set('path', t.get('path').push(t.get('children').size))
                .set('by', '2.i.a');
            
            t = t.set('children', t.get('children').push(tChildA));

            if (f.fCbyD(sigma, D)) {
                if (f.fCbyC(Set([sigma]), C)) {   // 2.i.b
                    let newO = O.delete(S);
                    let newF = updt(F, Set([S.get('s')]));

                    let tChild = fTConstructor()
                        .set('O', newO)
                        .set('F', newF)
                        .set('P', P)
                        .set('D', D)
                        .set('C', C)
                        .set('recentPO', 'O')
                        .set('step', t.get('step') + 1)
                        .set('aborted', false)
                        .set('success', P.isEmpty() && newO.isEmpty() && newF.isEmpty())
                        .set('path', t.get('path').push(t.get('children').size))
                        .set('by', '2.i.b');
                    
                    t = t.set('children', t.get('children').push(tChild));
                } else {    // 2.i.c
                    let newO = O.delete(S);
                    let newP = P.add(not(sigma));
                    let newF = updt(F, Set([S.get('s')]));

                    let tChild = fTConstructor()
                        .set('O', newO)
                        .set('C', C.add(sigma))
                        .set('D', D.union(A.intersect(Set([not(sigma)]))))
                        .set('F', newF)
                        .set('P', newP)
                        .set('recentPO', 'P')
                        .set('step', t.get('step') + 1)
                        .set('aborted', false)
                        .set('success', newP.isEmpty() && newO.isEmpty() && newF.isEmpty())
                        .set('path', t.get('path').push(t.get('children').size))
                        .set('by', '2.i.c');
                    
                    t = t.set('children', t.get('children').push(tChild));
                }
            }
        } else {    // 2.ii
            let newO = h.step2iiComputeO(O, R, S, C, sigma, f.fCbyC);
            let updateFWith = h.step2iiComputeUpdateFWith(R, S, C, sigma, f.fCbyC);
            let newF = updt(F, updateFWith);

            let tChild = fTConstructor()       
                .set('O', newO)
                .set('F', newF)
                .set('P', P)
                .set('D', D)
                .set('C', C)
                .set('recentPO', 'O')
                .set('step', t.get('step') + 1)
                .set('aborted', false)
                .set('success', P.isEmpty() && newO.isEmpty() && newF.isEmpty())
                .set('path', t.get('path').push(t.get('children').size))
                .set('by', '2.ii');
            
            t = t.set('children', t.get('children').push(tChild));
        }
    } else if (turn == 'F') {    // 3
        let S = i.memberF(F);

        console.log({F, S});

        if (fail.fail(fw, S)) {
            let newF = F.delete(S);
            let tChild = fTConstructor()       
                .set('O', O)
                .set('F', newF)
                .set('P', P)
                .set('D', D)
                .set('C', C)
                .set('recentPO', t.get('recentPO'))
                .set('step', t.get('step') + 1)
                .set('aborted', false)
                .set('success', P.isEmpty() && O.isEmpty() && newF.isEmpty())
                .set('path', t.get('path').push(t.get('children').size))
                .set('by', '3');
            
            t = t.set('children', t.get('children').push(tChild));
        } else {
            t = t.set('aborted', true);
        }
    } else {
        console.error('"turn" returned an unexpected value');
    }

    return t;
};

const fArgumentConstructor = sentence => 
    Map({
        s: OrderedSet([sentence]),
        m: Set()    // marked sentences
    });

// S_u
const fGetUnmarked = argument => argument.get('s').subtract(argument.get('m'));

// m(sigma, S)
const fMark = (argument, sentence) => 
    argument.get('s').includes(sentence) ?
        argument.set('m', argument.get('m').add(sentence)) :
        argument;

const fTConstructor = () =>
    Map({
        P: OrderedSet(),
        O: Set(),   // Set of Arguments
        D: Set(),
        C: Set(),
        F: Set(),
        step: 0,
        children: List(),    // List of Tuples
        aborted: false,
        success: false,
        path: List(),
        recentPO: null
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
            if (t.get('children').isEmpty()) {
                branches = branches.push(t);
            } else {
                branches = branches.concat(fGetBranches(t.get('children')));
            }
        }
    );

    return branches;
};

// list of all tuples along path in the computation tree
const fGetDerivation = (t, path, partialDerivation) =>
    (path.isEmpty()) ?
        partialDerivation.push(t.delete('children')) :
        fGetDerivation(
            t.getIn([
                'children', 
                path.first()
            ]), 
            path.shift(),
            partialDerivation.push(t.delete('children'))
        );

module.exports = {
    abadispute: (filters, updt, implementation) => 
        (framework, sentence) => {
            let t = fGetInitialT(framework, sentence);

            let getBranches = () => fGetBranches(List([t]));
            let getPath = branch => getBranches().get(branch).get('path');

            return {
                compute: (n) => {
                    t = fCompute(filters, updt, implementation, framework, t)(n);
                },
                getBranches,
                getSupport: branch => {
                    let leaf = getBranches().get(branch);

                    return leaf.get('success') ? 
                        leaf.get('D') : 
                        null;
                },
                getDerivation: branch => 
                    fGetDerivation(
                        t, 
                        getPath(branch),
                        List()
                    )
            };
    },

    filtersAB: {
        fDbyC: (R, C) => R.intersect(C).isEmpty(),
        fDbyD: (R, D) => R.subtract(D),
        fCbyD: (s, D) => !D.contains(s),
        fCbyC: (R, C) => !R.intersect(C).isEmpty()
    },
    
    filtersGB: {
        fDbyC: (R, C) => R.intersect(C).isEmpty(),
        fDbyD: (R, _D) => R,
        fCbyD: (s, D) => !D.contains(s),
        fCbyC: (_R, _C) => false
    },
    
    filtersIB: {
        fDbyC: (R, C) => R.intersect(C).isEmpty(),
        fDbyD: (R, D) => R.subtract(D),
        fCbyD: (s, D) => !D.contains(s),
        fCbyC: (R, C) => !R.intersect(C).isEmpty()
    },
    
    updtSimple: (F, _S) => F,
    
    updtIB: (F, S) => {
        return F.union(S);
    }, 
    
    implementationSimple: {
        sel: (S) => S.first(null),
        turn: (P, O, F, _recentPO) => {
            if (!P.isEmpty()) return 'P';
            if (!O.isEmpty()) return 'O';
            if (!F.isEmpty()) return 'F';

            console.error('no valid turn');
            return null;
        },
        memberO: (SS) => SS.first(),
        memberF: (SS) => SS.first()
    }, 
    
    implementationLP: {
        sel: (S) => S.last(null),
        turn: (P, O, F, recentPO) => {
            if (O.isEmpty() && !P.isEmpty()) return 'P';
            if (P.isEmpty() && !O.isEmpty()) return 'O';
            if (P.isEmpty() && O.isEmpty() && !F.isEmpty()) return 'F'
            if (recentPO == 'P' && !P.isEmpty()) return 'P';
            if (recentPO == 'O' && !O.isEmpty()) return 'O';

            console.error('no valid turn');
            return null;
        },
        memberO: (SS) => SS.first(),
        memberF: (SS) => SS.first()
    }
};
