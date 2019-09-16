# ABAdispute

## Introduction

ABAdispute is a JavaScript implementation of the X-dispute derivation as described by Francesca Toni in [1], and is therefore a library suited to evaluate ABA-Frameworks as first introduced in [2] by Phan Minh Dung et al.

The implementation, including variable and function names, follows the description in [1] closely, to facilitate easier correspondence.

## Usage

### Import the library

```javascript
const { abadispute, filtersAB, filtersGB, filtersIB, updtSimple, updtIB, implementationSimple, implementationLP } = require('abadispute.js');
```
### Set up a basic ABA-Framework

A framework is an Object that has to conain `rules`, `assumptions` and `contraries`. Rules and assumptions have to be arrays, contraries can be either an object or a function.

```javascript
var myAbaFramework = {
    rules: myRules,
    assumptions: myAssumptions,
    contraries: myContraries
};

var sentenceToCheck = 'sentence1'
```

#### Rules

Rules have to be of the form

```javascript
var myRule1 = {
    h: 'head',
    b: ['sentence1', 'sentence2', 'sentence3']   
};

var myRules = [myRule];
```
where `h` is the sentence representing the head, and `b` is an array representing the body of the rule.

#### Assumptions

Assumptions has to be an array of sentences, e.g.

```javascript
var myAssumptions = ['sentence1', 'sentence2'];
```

#### Contraries

Contraries can be either an object or a function. If it is an object, it has to be of the form

```javascript
var myContraries = {
    'sentence1': 'sentence3',
    'sentence2': 'sentence4'
};
```
Note that it is necessary, that for each assumption (as defined before), there must be a key in the contraries with the same name!

The contraries can also be defined in terms of a function, e.g.

```javascript
var myFunctionalContraries = function (assumption) {
    return 'not ' + assumption;
}
```
As is the case with contraries as objects, it is expected that contraries as a function returns a valid sentence for any assumption.

### Instantiate the dispute

```javascript
var instanceAB = abadispute(filtersAB, updtSimple, implementationSimple);
var disputeABinstance = instanceAB(myAbaFramework, sentenceToCheck);
```
This is an example of a simple AB instantiation, with filters for AB derivations a simple canonical implementation of the choice parameters. Filters, the `updt`-function and the implementation can be mixed and matched freely.

#### Custom implementation (optional)

If it is desired to specify custom parameters, this is also possible. In this case, the structures of the parameters have to follow this form:

```javascript
var { Map, Set, List } = require('immutable');

var myFilters: {
    fDbyC: function (R, C) { ... }, // any canonical implementation of fDbyC, returns Bool
    fDbyD: function (R, D) { ... }, // any canonical implementation of fDbyD, returns Set
    fCbyD: function (s, D) { ... }, // any canonical implementation of fCbyD, returns Bool
    fCbyC: function (R, C) { ... } // any canonical implementation of fCbyC, returns Bool
};

var myUpdt = function (F, S) { ... }; // any canonical implementation of updt, returns Set

var myImplementation: {
    sel: function (S) { ... },  // any canonical implementation of sel, returns String
    turn: function (P, O, F, recentPO) { ... },  // any canonical implementation of turn, returns either 'P', 'O' or 'F'
    memberO: function (SS) { ... },  // any canonical implementation of memberO, returns String
    memberF: function (SS) { ... }  // any canonical implementation of memberF, returns String
};
```
Note that in order to define a custom implementation, immutable.js has to be imported. `R`, `C`, `D`, `F`, `S`, `P` and `SS` are Immutable Sets, `s` is a string (sentence), and `recentPO` is a marker that shows if 'P' or 'O' were the last Sets that had been modified.

Then the dispute can be instantiated with

```javascript
var myInstance = abadispute(myFilters, myUpdt, myImplementation);
var disputeMyInstance = myInstance(myAbaFramework, sentenceToCheck);
```
### Computation

Start the computation with

```javascript
disputeABinstance.compute(8);
```
The parameter of the function is a numerical value and must not be omitted. It represents the maximum depth of the computation tree, i.e. represents an upper bound to the length of the derivation that can be found. However, previous computations will be stored, so in the following code

```javascript
disputeABinstance.compute(200); // compute the tree up to depth 200
disputeABinstance.compute(210); // compute the remaining steps to get to depth 210
```
the second line will not start over from scratch, but build upon the steps already computed. The reason for this decission is, that for frameworks that are (potentially) computationally demanding, we want to have a means of approaching a solution step by step in order not to get lost in a very long, but unfruitful branch.

### Evaluating the results

An overview of all the branches of the computation tree can be seen with

```javascript
var branches = disputeABinstance.getBranches();
```
Each Map in the List will represent the leaf node of this branch. A leaf can either be successful (`success: true`) or aborted (`aborted: true`), or the maximum of the computation depth has been reached, in which case the node might be neither successful, nor aborted.

The complete derivation of a branch can be seen with 

```javascript
var derivation = disputeABinstance.getDerivation(2);
```
Where `2` in the above example represents the number of the branch in the List of `branches`, i.e. the third branch.

In case the specified branch represents a successful derivation, the supporting sentences can be printed with

```javascript
var support = dispute1ABinstance.getSupport(2);
```

## Examples

Please refer to the files showcaseN.js in the root of the project for complete working examples. The showcase files can be tested with node, e.g. (in the root of the project):

```bash
node showcase1.js
```

## References

[1] _Toni, F. (2013). A generalised framework for dispute derivations in assumption-based argumentation. Artificial Intelligence, 195, 1-43._
[2] _Bondarenko, A., Dung, P. M., Kowalski, R. A., & Toni, F. (1997). An abstract, argumentation-theoretic approach to default reasoning. Artificial intelligence, 93(1-2), 63-101._