/* eslint-disable no-underscore-dangle */
/* eslint-disable array-element-newline */
/* eslint-disable no-undef */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */

const rewire = require('rewire');
const assert = require('assert');
const { Map, Set, List } = require('immutable');
const a = rewire('../abadispute.js');

const fCompute = a.__get__('fCompute');
const fAlgorithmStep = a.__get__('fAlgorithmStep');
const fArgumentConstructor = a.__get__('fArgumentConstructor');
const fDeleteFromArgument = a.__get__('fDeleteFromArgument');
const fArgumentAddSentences = a.__get__('fArgumentAddSentences');
const fGetUnmarked = a.__get__('fGetUnmarked');
const fMark = a.__get__('fMark');
const fTConstructor = a.__get__('fTConstructor');
const fGetInitialT = a.__get__('fGetInitialT');
const fGetBranches = a.__get__('fGetBranches');
const fGetDerivation = a.__get__('fGetDerivation');


describe('Helpers', function () {
    describe('#fArgumentConstructor', function () {
        it('Should return a map with indices "s" and "m", and "mySentence" as only element in "s"', function () {
            let argument = fArgumentConstructor('mySentence');

            assert.ok(argument.equals(
                Map({
                    s: Set(['mySentence']),
                    m: Set()
                }))
            );
        });
    });

    describe('#fDeleteFromArgument', function () {
        it('If marked, should remove "mySentence" from both "s" and "m"', function () {
            let argument = Map({
                s: Set(['a', 'b', 'c', 'mySentence']),
                m: Set(['a', 'c', 'mySentence'])
            });

            argument = fDeleteFromArgument(argument, 'mySentence');

            assert.ok(argument.equals(
                Map({
                    s: Set(['a', 'b', 'c']),
                    m: Set(['a', 'c'])
                })
            ));
        });
    });

    describe('#fDeleteFromArgument', function () {
        it('If not marked, should remove "mySentence" from "s"', function () {
            let argument = Map({
                s: Set(['a', 'b', 'c', 'mySentence']),
                m: Set(['a', 'c'])
            });

            argument = fDeleteFromArgument(argument, 'mySentence');

            assert.ok(argument.equals(
                Map({
                    s: Set(['a', 'b', 'c']),
                    m: Set(['a', 'c'])
                })
            ));
        });
    });

    describe('#fDeleteFromArgument', function () {
        it('If not in argument, should do nothing', function () {
            let argument = Map({
                s: Set(['a', 'b', 'c']),
                m: Set(['a', 'c'])
            });

            argument = fDeleteFromArgument(argument, 'mySentence');

            assert.ok(argument.equals(
                Map({
                    s: Set(['a', 'b', 'c']),
                    m: Set(['a', 'c'])
                })
            ));
        });
    });

    describe('#fArgumentAddSentences', function () {
        it('Should add "mySentence" to "s"', function () {
            let argument = Map({
                s: Set(['a', 'b', 'c']),
                m: Set(['a', 'c'])
            });

            argument = fArgumentAddSentences(argument, Set(['mySentence']));

            assert.ok(argument.equals(
                Map({
                    s: Set(['a', 'b', 'c', 'mySentence']),
                    m: Set(['a', 'c'])
                })
            ));
        });
    });

    describe('#fArgumentAddSentences', function () {
        it('Should add "mySentence1" and "mySentece2" to "s"', function () {
            let argument = Map({
                s: Set(['a', 'b', 'c']),
                m: Set(['a', 'c'])
            });

            argument = fArgumentAddSentences(argument, Set(['mySentence1', 'mySentence2']));

            assert.ok(argument.equals(
                Map({
                    s: Set(['a', 'b', 'c', 'mySentence1', 'mySentence2']),
                    m: Set(['a', 'c'])
                })
            ));
        });
    });

    describe('#fGetUnmarked', function () {
        it('Should return elements in "s" that are not in "m"', function () {
            let argument = Map({
                s: Set(['a', 'b', 'c', 'd']),
                m: Set(['a', 'c'])
            });

            let unmarked = fGetUnmarked(argument);

            assert.ok(unmarked.equals(
                Set(['b', 'd']),
            ));
        });
    });

    describe('#fMark', function () {
        it('If in argument, shoud add "mySentence" to "m"', function () {
            let argument = Map({
                s: Set(['a', 'b', 'c', 'mySentence']),
                m: Set(['a', 'c'])
            });

            argument = fMark(argument, 'mySentence');

            assert.ok(argument.equals(
                Map({
                    s: Set(['a', 'b', 'c', 'mySentence']),
                    m: Set(['a', 'c', 'mySentence'])
                })
            ));
        });
    });

    describe('#fMark', function () {
        it('If not in argument, shoud do nothing', function () {
            let argument = Map({
                s: Set(['a', 'b', 'c']),
                m: Set(['a', 'c'])
            });

            argument = fMark(argument, 'mySentence');

            assert.ok(argument.equals(
                Map({
                    s: Set(['a', 'b', 'c']),
                    m: Set(['a', 'c'])
                })
            ));
        });
    });

    describe('#fGetInitialT', function () {
        it('If "s" is in the assumptions, "P" should contain "a", "D" should contain "a"', function () {
            let framework = {
                rules: {
                    h: 'a',
                    b: 's'
                },
                assumptions: ['s'],
                contraries: {
                    's': '-s'
                }
            };

            let t = fGetInitialT(framework, 's');

            assert.ok(t.equals(
                Map({
                    P: Set(['s']),
                    O: Set(),   // Set of Arguments
                    D: Set(['s']),
                    C: Set(),
                    F: Set(),
                    step: 0,
                    children: List(),    // Set of Tuples
                    aborted: false,
                    success: false,
                    path: List(),
                    recentPO: null
                })
            ));
        });
    });

    describe('#fGetBranches', function () {
        it('Should return a list of the leaves', function () {
            let node1 = fTConstructor().set('C', Set(['1']));
            let node2 = fTConstructor().set('C', Set(['2']));
            let node3 = fTConstructor().set('C', Set(['3']));
            let node4 = fTConstructor().set('C', Set(['4']));
            let node5 = fTConstructor().set('C', Set(['5']));
            let node6 = fTConstructor().set('C', Set(['6']));
            let node7 = fTConstructor().set('C', Set(['7']));
            let node8 = fTConstructor().set('C', Set(['8']));
            let node9 = fTConstructor().set('C', Set(['9']));

            node6 = node6.set('children', Set([node7]));
            node4 = node4.set('children', Set([node5, node6]));
            node2 = node2.set('children', Set([node3]));
            node1 = node1.set('children', Set([node2, node4, node8, node9]));

            let leaves = fGetBranches(List([node1]));

            assert.ok(leaves.equals(List([node3, node5, node7, node8, node9])));
        });
    });

    describe('#fGetDerivation', function () {
        it('Should return a list of the leaves', function () {
            let node1 = fTConstructor().set('C', Set(['1']));
            let node2 = fTConstructor().set('C', Set(['2']));
            let node3 = fTConstructor().set('C', Set(['3']));
            let node4 = fTConstructor().set('C', Set(['4']));
            let node5 = fTConstructor().set('C', Set(['5']));
            let node6 = fTConstructor().set('C', Set(['6']));
            let node7 = fTConstructor().set('C', Set(['7']));
            let node8 = fTConstructor().set('C', Set(['8']));
            let node9 = fTConstructor().set('C', Set(['9']));

            node6 = node6.set('children', Set([node7]));
            node4 = node4.set('children', Set([node5, node6]));
            node2 = node2.set('children', Set([node3]));
            node1 = node1.set('children', Set([node2, node4, node8, node9]));

            let derivation = fGetDerivation(node1, List([1, 1, 0]), List());

            assert.ok(derivation.equals(List([node1, node4, node6, node7])));
        });
    });
});
