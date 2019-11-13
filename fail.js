const { Map, Set, List } = require('immutable');

const h = require('./helpers');

// qConstructor: (P: Set, O: Set, A: Set, C: Set) => {P: string[], O: string[], A: string[], C: string[]}
const qConstructor = (P, O, A, C) => 
    Map({
        P,
        O,
        A,
        C
    }).set('aborted', false);

// algorithmStep: (d: D) => D[]
const algorithmStepFactory = (fw, S) => D => {
    let newDs = List();
    let assumptions = Set(fw.assumptions);
    let rules = Set(fw.rules);
    let not = (typeof(fw.contraries) == 'function') ?
        fw.contraries :
        (a => fw.contraries[a]);

    D.forEach(
        Q => {
            let P = Q.get('P');
            let O = Q.get('O');
            let A = Q.get('A');
            let C = Q.get('C');

            if (P.isEmpty() && O.isEmpty()) return List([D.set('aborted', true)]);

            if (!O.isEmpty()) {
                // 1
                O.forEach(
                    o => {
                        if (o.isEmpty()) {
                            // 1.a
                            let Dnext = D.delete(Q);

                            newDs = newDs.push(Dnext);
                        } else {
                            // 1.b
                            o.forEach(
                                sigma => {
                                    if (!assumptions.contains(sigma)) {
                                        // 1.b.i
                                        let filter = (R, C) => !R.intersect(C).isEmpty();
                                        let Qprime = Q.set('O', h.step2iiComputeO(O, rules, S, C, sigma, filter));
                                        let Dnext = D.delete(Q).add(Qprime);

                                        let DnextJs = Dnext.toJS();

                                        newDs = newDs.push(Dnext);
                                    } else {
                                        // 1.b.ii
                                        if (!A.contains(sigma)) {
                                            // Case 1
                                            
                                            let Q0 = Q.set('O', O.delete(S).add(S.delete(sigma)));
                                            let Q1;

                                            if (C.contains(sigma)) {
                                                Q1 = Q.set('O', O.delete(S))
                                            } else {
                                                if (!assumptions.contains(not(sigma))) {
                                                    Q1 = Q
                                                        .set('O', O.delete(S))
                                                        .set('P', P.add(not(sigma)))
                                                        .set('C', C.add(sigma))
                                                } else {
                                                    Q1 = Q
                                                        .set('O', O.delete(S))
                                                        .set('A', A.add(not(sigma)))
                                                        .set('C', C.add(sigma))
                                                }
                                            }

                                            let Dnext = D.delete(Q).add(Q0).add(Q1);

                                            let DnextJs = Dnext.toJS();

                                            newDs = newDs.push(Dnext);
                                        } else {
                                            // Case 2
                                            let Q0 = Q.set('O', O.delete(S).add(S.delete(sigma)));
                                            let Dnext = D.delete(Q).add(Q0);

                                            newDs = newDs.push(Dnext);
                                        }
                                    }
                                }
                            ) 
                        }
                    }
                );
            }

            if (!P.isEmpty()) {
                // 2
                P.forEach(
                    sigma => {
                        if (assumptions.contains(sigma)) {
                            // 2.a
                            let Qprime = Q
                                .set('P', P.delete(sigma))
                                .set('O', O.add(Set([not(sigma)])))
                            let Dnext = D.delete(Q).add(Qprime);

                            newDs = newDs.push(Dnext);
                        } else {
                            // 2.b
                            let ruleExists = false;

                            rules.forEach(
                                rule => {
                                    if (rule.h == sigma) {
                                        ruleExists = true;

                                        let R = Set(rule.b);
                
                                        if (R.intersect(C).isEmpty()) {
                                            let Qprime = Q
                                                .set('P', P.delete(sigma).union(R.subtract(A)))
                                                .set('A', A.union(assumptions.intersect(R)))
                                            let Dnext = D.delete(Q).add(Qprime);

                                            newDs = newDs.push(Dnext);
                                        }
                                    }
                                }
                            )

                            if (!ruleExists) return List([D.set('aborted', true)]);
                        }
                    }
                )
            }
        }
    );

    return newDs;
};

// branchStepper: (f: (d: D => D[]), branches: Branch[]) => Branch[]
const branchStepper = (f, branches) =>
    branches
        .map(
            branch =>
                f(branch.last())
                    .map(newD => branch.push(newD))
        )
        .flatten(1);

module.exports = {
    fail: (fw, S) => {
        let Q0 = qConstructor(S, Set(), S.intersect(Set(fw.assumptions)), Set());
        let D0 = Set([Q0]);
        let branch0 = List([D0]);
        let branches = List([branch0]);
        let closedBranchExists = false;
        let algorithmStep = algorithmStepFactory(fw, S);
        let branchesJS = branches.toJS();

        while (!closedBranchExists && !branches.isEmpty()) {
            branches = branchStepper(algorithmStep, branches).filter(
                branch => !branch.last().get('aborted')
            );
            branchesJS = branches.toJS();
            closedBranchExists = branches.map(
                branch => branch.last().isEmpty()
            ).contains(true);

        }

        return closedBranchExists;
    }
};
