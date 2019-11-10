/* eslint-disable no-loop-func */
const { Map, Set, List, fromJS } = require('immutable');

// dConstructor: (P: Set, O: Set, A: Set, C: Set) => {P: string[], O: string[], A: string[], C: string[]}
const dConstructor = (P, O, A, C, closed, aborted) => 
    Map({
        P,
        O,
        A,
        C,
        closed,
        aborted
    });

// algorithmStep: (d: D) => D
const algorithmStep = (D) => {
    return List([dConstructor()]);
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
        let D0 = dConstructor(S, Set(), Set.intersect(fw.A, S), Set());
        let branches = fromJS([[D0]]);
        let closedBranchExists = false;

        while (!closedBranchExists) {
            branches = branchStepper(algorithmStep, branches);
            closedBranchExists = branches.map(
                branch => branch.last().get('closed')
            ).contains(true);
        }
    }
};
