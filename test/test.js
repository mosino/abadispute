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
                rules: [
                    {
                        h: 'a',
                        b: ['s']
                    }
                ],
                assumptions: ['s'],
                contraries: { 's': '-s' }
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
        it('Should return a list of nodes traversing the path', function () {
            let node1 = fTConstructor().set('C', Set(['1']));
            let node2 = fTConstructor().set('C', Set(['2']));
            let node3 = fTConstructor().set('C', Set(['3']));
            let node4 = fTConstructor().set('C', Set(['4']));
            let node5 = fTConstructor().set('C', Set(['5']));
            let node6 = fTConstructor().set('C', Set(['6']));
            let node7 = fTConstructor().set('C', Set(['7']));
            let node8 = fTConstructor().set('C', Set(['8']));
            let node9 = fTConstructor().set('C', Set(['9']));

            node6 = node6.set('children', List([node7]));
            node4 = node4.set('children', List([node5, node6]));
            node2 = node2.set('children', List([node3]));
            node1 = node1.set('children', List([node2, node4, node8, node9]));

            let derivation = fGetDerivation(node1, List([1, 1, 0]), List());

            assert.ok(derivation.equals(List([
                node1.delete('children'), 
                node4.delete('children'), 
                node6.delete('children'), 
                node7.delete('children')
            ])));
        });
    });
});

describe('Algorithm', function () {
    describe('#fAlgorithmStep', function () {
        describe('filtersGB', function () {
            describe('turn == "P" (1)', function () {                
                describe('sigma is in assumptions (1.i)', function () {
                    it('Should remove "c" from "P" and add "d" to "O"', function () {
                        let f = a.filtersGB;
                        let u = a.updtSimple;
                        let i = {
                            sel: (_P) => 'c',
                            turn: (_P, _O, _F, _recentPO) => 'P',
                            memberO: a.implementationSimple.memberO,
                            memberF: a.implementationSimple.memberF,
                        };

                        let fw = {
                            rules: [
                                {
                                    h: 'a',
                                    b: ['b']
                                }
                            ],
                            assumptions: ['c'],
                            contraries: { 'c': 'd' }
                        };

                        let argA = fArgumentConstructor('a');
                        let argB = fArgumentConstructor('b');
                        let argC = fArgumentConstructor('c');
                        let argNotC = fArgumentConstructor('d');

                        let t = fTConstructor()
                            .set('P', Set(['a', 'b', 'c', 'd']))
                            .set('O', Set([argA, argB, argC]))
                            .set('step', 4);

                        let newT = fAlgorithmStep(f, u, i, fw, t);
                        let newChildExpected = fTConstructor()
                            .set('P', Set(['a', 'b', 'd']))
                            .set('O', Set([argA, argB, argC, argNotC]))
                            .set('recentPO', 'O')
                            .set('step', 5)
                            .set('path', List([0]));

                        assert.ok(newT.get('children').first().equals(newChildExpected));
                    });
                });

                describe('sigma is not in assumptions (1.ii)', function () {
                    it('If there is no corresponding rule, should abort branch', function () {
                        let f = a.filtersGB;
                        let u = a.updtSimple;
                        let i = {
                            sel: (_P) => 'c',
                            turn: (_P, _O, _F, _recentPO) => 'P',
                            memberO: a.implementationSimple.memberO,
                            memberF: a.implementationSimple.memberF,
                        };

                        let fw = {
                            rules: [
                                {
                                    h: 'a',
                                    b: ['b']
                                }
                            ],
                            assumptions: ['d'],
                            contraries: { 'd': 'c' }
                        };

                        let argA = fArgumentConstructor('a');
                        let argB = fArgumentConstructor('b');
                        let argC = fArgumentConstructor('c');

                        let t = fTConstructor()
                            .set('P', Set(['a', 'b', 'c', 'd']))
                            .set('O', Set([argA, argB, argC]))
                            .set('step', 6);

                        let newT = fAlgorithmStep(f, u, i, fw, t);
                        let newTExpected = fTConstructor()
                            .set('P', Set(['a', 'b', 'c', 'd']))
                            .set('O', Set([argA, argB, argC]))
                            .set('step', 6)
                            .set('aborted', true);

                        assert.ok(newT.equals(newTExpected));
                    });

                    it('If there are corresponding rules, should add a child for each of them', function () {
                        let f = a.filtersGB;
                        let u = a.updtSimple;
                        
                        let i = {
                            sel: (_P) => 'c',
                            turn: (_P, _O, _F, _recentPO) => 'P',
                            memberO: a.implementationSimple.memberO,
                            memberF: a.implementationSimple.memberF,
                        };

                        let fw = {
                            rules: [
                                {
                                    h: 'c',
                                    b: ['a', 'd']
                                },
                                {
                                    h: 'c',
                                    b: ['b']
                                }
                            ],
                            assumptions: ['d'],
                            contraries: { 'd': 'c' }
                        };

                        let t = fTConstructor()
                            .set('P', Set(['x', 'c']))
                            .set('D', Set(['y']))
                            .set('step', 7);

                        let newT = fAlgorithmStep(f, u, i, fw, t);
                        let newTExpected = t.set('children', List([
                            fTConstructor()
                                .set('P', Set(['x', 'a', 'd']))
                                .set('D', Set(['y', 'd']))
                                .set('step', 8)
                                .set('recentPO', 'P')
                                .set('path', List([0])),
                            fTConstructor()
                                .set('P', Set(['x', 'b']))
                                .set('D', Set(['y']))
                                .set('step', 8)
                                .set('recentPO', 'P')
                                .set('path', List([1])),
                        ]));

                        assert.ok(newT.equals(newTExpected));
                    });
                });
            });

            describe('turn == "O" (2)', function () {
                describe('sigma is in assumptions (2.i)', function () {
                    it('Should add a child for the "ignore"-branch (2.i.a)', function () {
                        let u = a.updtSimple;

                        let f = {
                            fDbyC: a.filtersGB.fDbyC,
                            fDbyD: a.filtersGB.fDbyD,
                            fCbyD: (_C, _D) => false,
                            fCbyC: a.filtersGB.fCbyC,
                        };
                        let i = {
                            sel: (_P) => 'c',
                            turn: (_P, _O, _F, _recentPO) => 'O',
                            memberO: a.implementationSimple.memberO,
                            memberF: a.implementationSimple.memberF,
                        };

                        let fw = { assumptions: ['c'] };

                        let argA = fArgumentConstructor('a');
                        let argB = fArgumentConstructor('b');
                        let argC = fArgumentConstructor('c');
                        
                        argC = fArgumentAddSentences(argC, Set(['d']));

                        let argCMarked = fMark(argC, 'c');

                        let t = fTConstructor()
                            .set('O', Set([argC, argA, argB]))
                            .set('step', 2);

                        let newT = fAlgorithmStep(f, u, i, fw, t);

                        let newChildExpected = fTConstructor()
                            .set('O', Set([argCMarked, argA, argB]))
                            .set('step', 3)
                            .set('recentPO', 'O')
                            .set('path', List([0]));

                        assert.ok(newT.get('children').first().equals(newChildExpected));
                    });

                    describe('Is a defence and a culprit (2.i.b)', function () {
                        it('Should move argument to F', function () {
                            let f = {
                                fDbyC: a.filtersIB.fDbyC,
                                fDbyD: a.filtersIB.fDbyD,
                                fCbyD: (_C, _D) => true,
                                fCbyC: (_C, _D) => true,
                            };
                            let u = a.updtIB;
                            let i = {
                                sel: (_P) => 'c',
                                turn: (_P, _O, _F, _recentPO) => 'O',
                                memberO: a.implementationSimple.memberO,
                                memberF: a.implementationSimple.memberF,
                            };

                            let fw = { assumptions: ['c'] };

                            let argA = fArgumentConstructor('a');
                            let argB = fArgumentConstructor('b');
                            let argC = fArgumentConstructor('c');
                            
                            argC = fArgumentAddSentences(argC, Set(['d']));

                            let t = fTConstructor()
                                .set('O', Set([argC, argA, argB]))
                                .set('step', 3);

                            let newT = fAlgorithmStep(f, u, i, fw, t);

                            let newChildExpected = fTConstructor()
                                .set('O', Set([argA, argB]))
                                .set('F', Set(['c', 'd']))
                                .set('step', 4)
                                .set('recentPO', 'O')
                                .set('path', List([1]));

                            assert.ok(newT.get('children').get(1).equals(newChildExpected));
                        });
                    });

                    describe('Is a defence and no culprit (2.i.c)', function () {
                        it('Should move argument to F, expand culprits, start counter-attack in "P"', function () {
                            let f = {
                                fDbyC: a.filtersIB.fDbyC,
                                fDbyD: a.filtersIB.fDbyD,
                                fCbyD: (_C, _D) => true,
                                fCbyC: (_C, _D) => false,
                            };
                            let u = a.updtIB;
                            let i = {
                                sel: (_P) => 'c',
                                turn: (_P, _O, _F, _recentPO) => 'O',
                                memberO: a.implementationSimple.memberO,
                                memberF: a.implementationSimple.memberF,
                            };

                            let fw = {
                                assumptions: ['c', 'notc'],
                                contraries: { 'c': 'notc' }
                            };

                            let argA = fArgumentConstructor('a');
                            let argB = fArgumentConstructor('b');
                            let argC = fArgumentConstructor('c');
                            
                            argC = fArgumentAddSentences(argC, Set(['d']));

                            let t = fTConstructor()
                                .set('O', Set([argC, argA, argB]))
                                .set('C', Set(['x']))
                                .set('D', Set(['y']))
                                .set('P', Set(['z']))
                                .set('step', 3);

                            let newT = fAlgorithmStep(f, u, i, fw, t);

                            let newChildExpected = fTConstructor()
                                .set('O', Set([argA, argB]))
                                .set('C', Set(['x', 'c']))
                                .set('D', Set(['y', 'notc']))
                                .set('F', Set(['c', 'd']))
                                .set('P', Set(['z', 'notc']))
                                .set('step', 4)
                                .set('recentPO', 'P')
                                .set('path', List([1]));

                            assert.ok(newT.get('children').get(1).equals(newChildExpected));
                        });
                    });
                });
                describe('sigma is not in assumptions (2.ii)', function () {
                    it('Should unfold premise with all rules, add new arguments to "F" if dealt with, to "O" if not', function () {
                        let f = a.filtersIB;
                        let u = a.updtIB;

                        let i = {
                            sel: (_P) => 'c',
                            turn: (_P, _O, _F, _recentPO) => 'O',
                            memberO: a.implementationSimple.memberO,
                            memberF: a.implementationSimple.memberF,
                        };

                        let fw = {
                            assumptions: ['a'],
                            rules: [
                                {
                                    h: 'c',
                                    b: ['a', 'b']
                                },
                                {
                                    h: 'c',
                                    b: ['d', 'e']
                                },
                                {
                                    h: 'c',
                                    b: ['f', 'g']
                                },
                                {
                                    h: 'c',
                                    b: ['h']
                                },
                                {
                                    h: 'c',
                                    b: ['i']
                                },
                                {
                                    h: 'b',
                                    b: ['a']
                                }
                            ]
                        };

                        let argA = fArgumentConstructor('a');
                        let argB = fArgumentConstructor('b');
                        let argC = fArgumentConstructor('c');
                        
                        argC = fArgumentAddSentences(argC, Set(['y']));

                        let t = fTConstructor()
                            .set('O', Set([argC, argA, argB]))
                            .set('F', Set(['x']))
                            .set('C', Set(['a', 'b', 'd', 'h']))
                            .set('step', 7);

                        let newT = fAlgorithmStep(f, u, i, fw, t);

                        let argChildC1 = fArgumentConstructor('y');
                        let argChildC2 = fArgumentConstructor('y');
                        
                        argChildC1 = fArgumentAddSentences(argChildC1, Set(['f', 'g']));
                        argChildC2 = fArgumentAddSentences(argChildC2, Set(['i']));

                        let newChildExpected = fTConstructor()
                            .set('O', Set([argA, argB, argChildC1, argChildC2]))
                            .set('F', Set(['x', 'y', 'a', 'b', 'd', 'e', 'h']))
                            .set('C', Set(['a', 'b', 'd', 'h']))
                            .set('step', 8)
                            .set('recentPO', 'O')
                            .set('path', List([0]));

                        assert.ok(newT.get('children').first().equals(newChildExpected));
                    });
                });
            });
        });
    });
});
