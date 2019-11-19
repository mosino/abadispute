# ABAdispute

Note: a graphical user interface to play around with ABA frameworks based on this library can be found here: <http://moritzsinowatz-abagui.s3-website.eu-central-1.amazonaws.com/>

## Introduction

Assumption-Based Argumentation is a framework that was introduced in the 90s by P. M. Dung et. al. as a framework to generalize different approaches to default reasoning \[1\].

What is default reasoning? In classical, monotonic logics, if something can be prooven, that means it stays true forever, even if new information is gathered. Consider the following example: We know, that all prime numbers greater than two are odd. We have the information, that `x` is a prime number, and that it is greater than two. Now we can derive, that `x` must be odd. Even if we get new information (e.g. that `x` is a positive integer smaller than 10), this won't change anything about the fact, that it must be an odd number.

However, this does not always reflect how humans reason. For example, you might hear a story about a person (Anna) buying ice cream for all the children. Everybody knows (or to be more exact, assumes), that all children love ice cream, so you will come to the conclusion that all the children were happily eating ice cream. But now Anna tells you that there is one odd kid in the group who absolutely hates ice cream. You will then, based on that new information, have to revert that conclusion and conclude instead, that there was at least one child who was not so happy. This is where non-monotonic reasoning comes into play, providing mechanisms to reflect this kind of reasoning.

Assumption-Based Argumentation, as a generalizing framework, does not rely on any specific (logical) language, and provides a means of modelling different kinds of default logics.

## Assumption-Based Argumentation (ABA)
An ABA framework consists of four parts and is written as a touple `<L,R,A,‾>`, where `L` represents the language, `R` a set of rules, `A` a set of assumptions and `‾` a mapping of each assumption to their contrary [3], [4].

The set `R` consists of rules in the form `h ← b1,...,bn`, where `h` and `bi` represent sentences of the specified language. The intended meaning of a rule is, that if all `bi` can reasonably be assumed, we should then conclude `h`. The body of a rule can be empty, i.e. the rule looks like `h ←`. In this case, we speak of a fact.

Assumptions `A` represent sentences, that are assumed to be true, however, we can later decide that they are not true after all. Contraries are the sentences that are in conflict with the given assumption, i.e. an assumption and its contrary cannot be true at the same time.

## X-Dispute Derivation

X-Dispute Derivations were introduced in 2011 by F. Toni as a generalized algorithm to solve the derivability of a sentence in a given ABA framework under certain semantics [3], [2]. For more information about these semantics and the concrete implementation of X-Dispute Derivations please refer to [3], [2] and [4].

ABAdispute is a JavaScript implementation of the X-dispute derivation.

The implementation, including variable and function names, follows the description in [3] closely, to facilitate easier correspondence.

## Usage

### Import the library

If the abadispute folder is placed in the root of your project

```javascript
const { abadispute, filtersAB, filtersGB, filtersIB, updtSimple, updtIB, implementationSimple, implementationLP } = require('./abadispute/abadispute.js');
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
This is an example of a simple AB instantiation, with filters for AB derivations and a simple canonical implementation of the choice parameters. Filters, the `updt`-function and the implementation can be mixed and matched freely.

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
Note that in order to define a custom implementation, immutable.js has to be imported. `R`, `C`, `D`, `F`, `S`, `P` and `SS` are Immutable Sets, `s` is a string (sentence), and `recentPO` is a marker that shows if `P` or `O` were the last Sets that had been modified.

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

Please refer to the files **showcase1.js** to **showcase4.js** in the root of the project for complete working examples. The showcase files can be tested with node, e.g. (in the root of the project):

```bash
node showcase1.js
```

(Note: don't forget to initialize the project with `npm install` first)

## References

[1] [A. Bondarenko, P. Dung, R. Kowalski, F. Toni (1997). An abstract, argumentation-theoretic approach to default reasoning, Artificial Intelligence 93 (1–2), 63–101.](https://www.sciencedirect.com/science/article/pii/S0004370297000155)

[2] [P. M. Dung, P. Mancarella, F. Toni (2007). Computing ideal sceptical argumentation. Artificial Intelligence, 171 (10-15), 642-674.](https://www.sciencedirect.com/science/article/pii/S000437020700080X)

[3] [F. Toni (2013). A generalised framework for dispute derivations in assumption-based argumentation. Artificial Intelligence 195, 1-43.](https://www.sciencedirect.com/science/article/pii/S0004370212001233)

[4] [K. Čyras, X. Fan, C. Schulz, F. Toni (2017). Assumption-based argumentation: disputes, explanations, preferences. J. Appl. Logics-IfCoLoG J. Logics Appl, 4(8), 2407-2456.](https://pdfs.semanticscholar.org/7da8/fb9d0e6e3ee414875362b24be9453e905773.pdf#page=320)
                    
                