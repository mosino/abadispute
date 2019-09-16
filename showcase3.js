/* eslint-disable array-element-newline */
/* eslint-disable no-unused-vars */
const { abadispute, filtersAB, filtersGB, filtersIB, updtSimple, updtIB, implementationSimple, implementationLP } = require('./abadispute.js');

const abaframework = {
    rules: [
        {
            h: 'p',
            b: ['a']   
        },
        {
            h: 'q',
            b: ['b']   
        },
        {
            h: 'r',
            b: ['c']   
        },
        {
            h: 's',
            b: ['b']
        }
    ],
    assumptions: ['a', 'b', 'c'],
    contraries: {
        'a': 'q',
        'b': 'r',
        'c': 's'
    }
};

const sentenceToCheck = 'r';

let instanceAB = abadispute(filtersAB, updtSimple, implementationSimple);
let dispute1ABinstance = instanceAB(abaframework, sentenceToCheck);

dispute1ABinstance.compute(8);

let branches = dispute1ABinstance.getBranches();

branches.map((v, k) => {
    let derivation = dispute1ABinstance.getDerivation(k);
    let support = dispute1ABinstance.getSupport(k);

    console.log('\n------------');
    console.log(`Branch ${k}:`);
    console.log('------------\n');
    console.log('Derivation:');
    console.log(JSON.stringify(derivation, 0, 2));
    console.log(`\nSupport: ${support}`);
});

console.log(`\nFound ${branches.size} branches, ${branches.filter(b => b.get('success')).size} of which represent successful derivations`);
