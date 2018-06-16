import nock from 'nock';
import os from 'os';
import fs from 'fs';
import mzfs from 'mz/fs';
import pathlib from 'path';
import rimraf from 'rimraf';
import { getRootNameToSave, getBaseUrl, getAssetNameToSave } from '../src/names';
import download from '../src/download';
import { fetchAndSave } from '../src';
import parseHtml from '../src/parse';

describe('getHtmlFileName, getBaseUrl, getAssetNameToSave (names.js)', () => {
  test('root name without path', () =>
    expect(getRootNameToSave('https://ru.hexlet.io'))
      .toBe('ru-hexlet-io'));
  test('root name with path', () =>
    expect(getRootNameToSave('https://ru.hexlet.io/my/code_reviews'))
      .toBe('ru-hexlet-io-my-code_reviews'));
  test('root name with path and query', () =>
    expect(getRootNameToSave('https://ru.hexlet.io/code_reviews/42695?submission_id=61323'))
      .toBe('ru-hexlet-io-code_reviews-42695-submission_id-61323'));
  test('base url from string with path and query', () =>
    expect(getBaseUrl('https://ru.hexlet.io/code_reviews/42695?submission_id=61323'))
      .toBe('https://ru.hexlet.io'));
  test('base url from string with port and path', () =>
    expect(getBaseUrl('https://ru.hexlet.io:8080/code_reviews/42695'))
      .toBe('https://ru.hexlet.io:8080'));
  test('asset name from full url', () => {
    expect(getAssetNameToSave('https://ru.hexlet.io:8080/code_reviews/42695/megastyle.css'))
      .toBe('code_reviews-42695-megastyle.css');
  });
  test('asset name from relative url', () => {
    expect(getAssetNameToSave('/assets/pictures/gymnastics.jpg'))
      .toBe('assets-pictures-gymnastics.jpg');
  });
});

describe('HTML file downloaded (download.js)', () => {
  test('load html succsess', async () => {
    const result = '<html><head></head><body>Hexlet courses</body></html>';
    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, result);
    const response = await download('https://ru.hexlet.io/courses');
    expect(response.data).toBe(result);
  });
  test('common network error', async () => {
    nock('https://ru.hexlet.io')
      .get('/courses')
      .replyWithError('downloader.js connection error');
    await expect(download('https://ru.hexlet.io/courses'))
      .rejects
      .toThrow();
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
    await fetchAndSave(address, dir);
    const readData = await mzfs.readFile(pathlib.join(dir, `${getRootNameToSave(address)}.html`), 'utf8');
    expect(readData.toString()).toBe(result);
  });

  test('common network error', async () => {
    nock('https://ru.hexlet.io')
      .get('/courses')
      .replyWithError('index.js connection error');
    await expect(fetchAndSave(address, dir))
      .rejects
      .toThrow();
  });

  test('404 error', async () => {
    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(404, 'not found');
    await expect(fetchAndSave(address, dir))
      .rejects
      .toThrow();
  });

  test('create directory in prohibited area (at root)', async () => {
    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, result);
    await expect(fetchAndSave(address, '/directoryDoesNotExist'))
      .rejects
      .toThrow("You are trying to create directory 'directoryDoesNotExist' in a system-protected place '/'");
  });

  test('create directory in prohibited area (at /sys)', async () => {
    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, result);
    await expect(fetchAndSave(address, '/sys/directoryDoesNotExist'))
      .rejects
      .toThrow("You are trying to create directory 'directoryDoesNotExist' in a system-protected place '/sys'");
  });

  test('create directory at non-existing path (at ~/home/directoryDoesNotExist)', async () => {
    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, result);
    await expect(fetchAndSave(address, '~/home/directoryDoesNotExist'))
      .rejects
      .toThrow("Impossible to create directory 'directoryDoesNotExist' because there are non-existing dir(s)");
  });

  test('save file to system-protected place', async () => {
    nock('https://ru.hexlet.io')
      .get('/courses')
      .reply(200, result);
    await expect(fetchAndSave(address, '/sys'))
      .rejects
      .toThrow("You selected a system-protected directory '/sys' to save file");
  });
});

describe('parser should return proper asset lists', () => {
  const address = 'https://ru.hexlet.io/knowledge';
  const assetFixturesPath = './__tests__/__fixtures__/with_assets/';

  test('amount of proper links (with href/src)', async () => {
    nock('https://ru.hexlet.io')
      .get('/knowledge')
      .reply(200, fs.readFileSync(`${assetFixturesPath}hexlet_knowledge.html`, 'utf8'));

    const folder = `${process.cwd()}/${getRootNameToSave(address)}_files`;
    const html = await download(address);
    const result = await parseHtml(html.data, folder, address);
    expect(result[1]).toHaveLength(10);
  });
});
