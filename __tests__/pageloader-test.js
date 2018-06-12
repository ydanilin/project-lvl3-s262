import nock from 'nock';
import os from 'os';
import fs from 'fs';
import mzfs from 'mz/fs';
import pathlib from 'path';
import rimraf from 'rimraf';
import getHtmlFileName from '../src/names';
import download from '../src/download';
import downloader from '../src';

describe('HTML file name is correct (names.js)', () => {
  test('without path', () =>
    expect(getHtmlFileName('https://ru.hexlet.io'))
      .toBe('ru-hexlet-io.html'));
  test('with path', () =>
    expect(getHtmlFileName('https://ru.hexlet.io/my/code_reviews'))
      .toBe('ru-hexlet-io-my-code_reviews.html'));
  test('with path and query', () =>
    expect(getHtmlFileName('https://ru.hexlet.io/code_reviews/42695?submission_id=61323'))
      .toBe('ru-hexlet-io-code_reviews-42695-submission_id-61323.html'));
});

describe('HTML file downloaded (download.js)', () => {
  test('load html succsess', async () => {
    const result = '<html><head></head><body>Hexlet courses</body></html>';
    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, result);
    expect.assertions(1);
    const response = await download('https://ru.hexlet.io/courses');
    expect(response.data).toBe(result);
  });
  test('common network error', async () => {
    nock('https://ru.hexlet.io')
      .get('/courses')
      .replyWithError('connection error');
    expect.assertions(1);
    try {
      await download('https://ru.hexlet.io/courses');
    } catch (e) {
      expect(e).toEqual(Error('connection error'));
    }
  });
});

describe('HTML file saved (whole workflow test, index.js)', () => {
  const result = '<html><head></head><body>Hexlet courses</body></html>';
  const address = 'https://ru.hexlet.io/courses';
  const dirList = [];
  let dir = './';

  beforeEach(() => {
    dir = fs.mkdtempSync(`${os.tmpdir()}${pathlib.sep}`);
    dirList.push(dir);
  });

  afterAll(() => {
    dirList.map(d => rimraf(d, () => {}));
  });

  test('file loaded and saved', async () => {
    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, result);
    expect.assertions(1);
    await downloader(address, dir);
    const readData = await mzfs.readFile(pathlib.join(dir, getHtmlFileName(address)), 'utf8');
    expect(readData.toString()).toBe(result);
  });

  test('common network error', async () => {
    nock('https://ru.hexlet.io')
      .get('/courses')
      .replyWithError('connection error');
    expect.assertions(1);
    try {
      await downloader(address, dir);
    } catch (e) {
      expect(e).toEqual(Error('connection error'));
    }
  });

  test('404 error', async () => {
    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(404, 'not found');
    expect.assertions(1);
    try {
      await downloader(address, dir);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
  });

  test('wrong output directory name error', async () => {
    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, result);
    expect.assertions(1);
    try {
      await downloader(address, '/directoryDoesNotExist');
    } catch (e) {
      expect(e.code).toBe('ENOENT');
    }
  });
});
