const puppeteer = require('puppeteer')
import * as fs from 'fs'
import * as path from 'path'

import { build, open } from './setup'
import { Browser } from 'puppeteer'

let browser: Browser | null = null

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
      test(fixture, () => testRunner(fixture, true, false))
      test(fixture + ' (extract css)', () => testRunner(fixture, false, false))
      test(fixture + ' (shadow mode)', () => testRunner(fixture, true, true))
    })
})

afterAll(async () => browser && (await browser.close()))

async function testRunner(
  fixture: string,
  extractCss: boolean,
  shadowMode: boolean,
  moreAssertions?: Function
): Promise<void> {
  const filename = path.join(__dirname, 'fixtures', fixture + '.vue')
  try {
    const code = await build(filename, extractCss, shadowMode)

    const page = await open(
      fixture + (extractCss && !shadowMode ? '-extract' : '') + (shadowMode ? '-shadow' : ''),
      browser!,
      code,
      shadowMode
    )
    
    expect(await page.evaluate(
      (shadowMode) => {
        return shadowMode
          ? !!document.getElementById('app')!.shadowRoot!.getElementById('test')
          : !!document.getElementById('test')
      }, shadowMode)
    ).toBeTruthy()
    expect(
      await page.evaluate((shadowMode) => {
        const context = shadowMode ? document.getElementById('app')!.shadowRoot! : document
        return context.getElementById('test')!.textContent
      }, shadowMode)
    ).toEqual(expect.stringContaining('Hello'))
    expect(
      await page.evaluate(
        (shadowMode) => {
          const context = shadowMode ? document.getElementById('app')!.shadowRoot! : document
          return window.getComputedStyle(context.getElementById('test')!).color
        }, shadowMode
      )
    ).toEqual('rgb(255, 0, 0)')

    moreAssertions && moreAssertions(page)

    await page.close()
  } catch (error) {
    console.error({ error })
    

    throw error
  }
}
