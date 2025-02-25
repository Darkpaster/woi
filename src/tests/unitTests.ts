// const { assert } = require("chai");
import { assert } from 'chai'

describe("pow", function () {

    // before(() => console.log("Тестирование началось – перед тестами"));
    // after(() => console.log("Тестирование закончилось – после всех тестов"));

    // beforeEach(() => console.log("Перед тестом – начинаем выполнять тест"));
    // afterEach(() => console.log("После теста – заканчиваем выполнение теста"));

    describe("возводит x в степень y", function () {

        function makeTest(x: number, y: number) {
            const expected = x ** y;
            it(`${x} в степени ${y} будет ${expected}`, function () {
                // assert.equal(pow(x, y), expected);
            });
        }
        for (let x = 1; x <= 10; x++) {
            makeTest(Math.round(Math.random() * x), Math.round(Math.random() * x));
        }
    })



});