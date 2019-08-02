# abadispute

```javascript
import * from 'immutable';
import * from 'abadispute';

var abaframework1 = {
    rules: [
        {
            h: 'q',
            b: ['a', 'b', 'c']
        },
        {
            h: '-a',
            b: 'c'
        },
        {
            h: '-b'
        }
    ],
    assumptions: ['a', 'b', 'c'],
    contraries: function (assumption) {
        return '-' + assumption;
    }
}

var abaframework2 = {
    rules: [
        {
            h: 'q',
            b: ['a', 'b', 'c']
        },
        {
            h: '-a',
            b: 'c'
        },
        {
            h: '-b'
        }
    ],
    assumptions: ['a', 'b', 'c'],
    contraries: {
        'a': 'q',
        'b': 'r',
        'c': 's'
    }
}

var sentenceToCheck = 'q';

var dispute1 = new AbadisputeGB(abaframework1, sentenceToCheck);
var dispute2 = new AbadisputeAB(abaframework1, sentenceToCheck);
var dispute3 = new AbadisputeIB(abaframework2, sentenceToCheck);
var dispute4 = new AbadisputeLP(abaframework2, sentenceToCheck);
var dispute5 = new Abadispute(abaframework2, sentenceToCheck, my_fDbyC, my_fDbyD, my_fCbyD, my_fCbyC, my_updt, my_sel, my_memberO, my_memberF, my_turn);

dispute1.compute(3); // depth at most 3
dispute2.compute(4); // depth at most 4
dispute3.compute(); // compute until all branches fail/succeed
dispute4.compute(); // compute until all branches fail/succeed
dispute5.compute(); // compute until all branches fail/succeed
dispute1.compute(2); // does nothing
dispute1.compute(5); // 5 more additional steps in depth

console.log(dispute1.getBranches()); // ['fail', 'fail', 'pending', 'fail', 'success']
console.log(dispute1.getSupport(0)); // error: branch failed
console.log(dispute1.getSupport(2)); // error: calculation pending
console.log(dispute1.getSupport(4)); // ['a', 'b']
console.log(dispute1.getDerivation(0)); // [{P: ..., O: ..., D: ..., C: ..., F: ...},{P: ..., O: ..., D: ..., C: ..., F: ...},...]
console.log(dispute1.getDerivation(2)); // [{P: ..., O: ..., D: ..., C: ..., F: ...},{P: ..., O: ..., D: ..., C: ..., F: ...},...]
console.log(dispute1.getDerivation(4)); // [{P: ..., O: ..., D: ..., C: ..., F: ...},...,{P: ..., O: ..., D: ['a', 'b'], C: ..., F: ...}]
```

