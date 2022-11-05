import fetchMock from 'jest-fetch-mock'

const mockAPIResponse = require('../../src/server/mockAPI.js');
const fetch = require('jest-fetch-mock');

describe ("Testing app functionality", () => {
  beforeEach(() => {
    fetch.resetMocks()
  })

  test ('Test URL Request', () => {
    let json = {
        'title': 'test json response',
        'message': 'this is a message',
        'time': 'now'
    }
    expect(mockAPIResponse).toMatchObject(json);
  })

  test ('Test API call', () => {
    let dataObj = {
      weather: [
        {Date: '2022-11-05', Weather: 'Few clouds'}
      ],
      picture: 'https://pixabay.com/get/g129ff65984963f274c21be8281b101ecfb9ba9cc167ad6aab28d4dba225dde98898a114000fe72f4fe0adac54d5a50642f25dce5b20fbb7e075bc75fe5937447_640.jpg'
    };
    
    fetchMock.mockResponseOnce(JSON.stringify(dataObj));

    fetchMock("https://pixabay.com/get/g129ff65984963f274c21be8281b101ecfb9ba9cc167ad6aab28d4dba225dde98898a114000fe72f4fe0adac54d5a50642f25dce5b20fbb7e075bc75fe5937447_640.jpg")
    .then((response) => response.json())
        .then( function (ret) {
            expect(ret).toEqual(dataObj)
        })
    expect(fetchMock.mock.calls[0][0]).toEqual("https://pixabay.com/get/g129ff65984963f274c21be8281b101ecfb9ba9cc167ad6aab28d4dba225dde98898a114000fe72f4fe0adac54d5a50642f25dce5b20fbb7e075bc75fe5937447_640.jpg")
  })
});

