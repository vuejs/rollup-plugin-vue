const puppeteer = require('puppeteer')
import * as fs from 'fs'
import * as path from 'path'

import {build, open} from "./setup"

let browser = null

beforeAll(async () => {
  browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: Boolean(process.env.CI)
  })
})

describe('baseline', () => {
  fs.readdirSync(path.join(__dirname, 'fixtures'))
    .filter((filename: string) => filename.endsWith('.vue'))
    .map((filename: string) => filename.replace(/\.vue$/i, ''))
    .forEach(fixture => {
      test(fixture, () => testRunner(fixture, true))
      test(fixture + ' (extract css)', () => testRunner(fixture, false))
    })
})

afterAll(async () => browser && (await browser.close()))

async function testRunner(fixture: string, extractCss: boolean): Promise<void> {
  const filename = path.join(__dirname, 'fixtures', fixture + '.vue')
  const code = await build(filename, extractCss)
  const page = await open(
    fixture + (extractCss ? '-extract' : ''),
    browser,
    code
  )
  expect(await page.$('#test')).toBeTruthy()
  expect(
    await page.evaluate(() => document.getElementById('test').textContent)
  ).toEqual(expect.stringContaining('Hello'))
  expect(
    await page.evaluate(
      () => window.getComputedStyle(document.getElementById('test')).color
    )
  ).toEqual('rgb(255, 0, 0)')

  await page.close()
}
