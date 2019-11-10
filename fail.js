/* eslint-disable no-loop-func */
const { Map, Set, List } = require('immutable');

// dConstructor: (P: Set, O: Set, A: Set, C: Set) => {P: string[], O: string[], A: string[], C: string[]}
const dConstructor = (P, O, A, C) => 
    Map({
        P,
        O,
        A,
        C
    });

// branchConstructor: (closed: boolean, aborted: boolean, dList: D[]) => {closed: boolean, aborted: boolean, dList: D[]}
const branchConstructor = (closed, dList) => 
    Map({
       closed,
       aborted,
       dList
    });

// algorithmStep: (d: D) => D
const algorithmStep = (D) => {
    return List([dConstructor()]);
};

// branchStepper: (f: (d: D => D[]), branches: Branch[]) => Branch[]
const branchStepper = (f, branches) => {
    let branchedBranches = branches.map(branch =>
        f(branch.last())
            .map(newD => 
                branch.push(newD)
            )
    );

    return branchedBranches.flatten(1);
};

module.exports = {
    fail: (fw, S) => {
        let D0 = dConstructor(S, Set(), Set.intersect(fw.A, S), Set());
        let branches = List(branchConstructor(false, false, List([D0])));
        let closedBranchExists = false;

        while (!closedBranchExists) {
            let newBranches = List();

            branches.filter(branch => !branch.closed).map(branch => {
                let newDs = algorithmStep(branch.dList.last());

                newDs.map(newD => {
                    let newBranch = branch;

                    newBranch.dList = newBranch.dList.push(newD);
                    newBranches.push(newBranch);
                });
            });
        }
    }
};
