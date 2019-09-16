/* eslint-disable array-element-newline */
/* eslint-disable no-unused-vars */
const { abadispute, filtersAB, filtersGB, filtersIB, updtSimple, updtIB, implementationSimple, implementationLP } = require('./abadispute.js');

const abaframework = {
    rules: [
        {
            h: 'p',
            b: ['q']   
        },
        {
            h: 'p',
            b: ['a']   
        },
        {
            h: 'r',
            b: ['b', 'c']   
        },
        {
            h: 't',
            b: []   
        }
    ],
    assumptions: ['a', 'b', 'c'],
    contraries: {
        'a': 'r',
        'b': 's',
        'c': 't'
    }
};

const sentenceToCheck = 'p';

let instanceGB = abadispute(filtersGB, updtSimple, implementationSimple);
let dispute1GBinstance = instanceGB(abaframework, sentenceToCheck);

dispute1GBinstance.compute(8);

let branches = dispute1GBinstance.getBranches();

branches.map((v, k) => {
    let derivation = dispute1GBinstance.getDerivation(k);
    let support = dispute1GBinstance.getSupport(k);

    console.log('\n------------');
    console.log(`Branch ${k}:`);
    console.log('------------\n');
    console.log('Derivation:');
    console.log(JSON.stringify(derivation, 0, 2));
    console.log(`\nSupport: ${support}`);
});

console.log(`\nFound ${branches.size} branches, ${branches.filter(b => b.get('success')).size} of which represent successful derivations`);
