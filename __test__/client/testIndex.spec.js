import { submitText } from '../../src/client/js/app' 

const fetch = require('jest-fetch-mock');

describe ("Testing submitText functionality", () => {
    beforeEach(() => {
        fetch.resetMocks()
    })
    test("Testing submitText functionality", () => {
        expect(submitText).toBeDefined();
    })
})