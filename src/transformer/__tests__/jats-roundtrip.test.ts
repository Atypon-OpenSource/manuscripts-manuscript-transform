/*!
 * © 2020 Atypon Systems LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Model } from '@manuscripts/manuscripts-json-schema'
import fs from 'fs-extra'
import { parseXml } from 'libxmljs2'
import mime from 'mime-types'

import { Decoder } from '../decode'
import {
  createCounter,
  IDGenerator,
  JATSExporter,
  MediaPathGenerator,
} from '../jats-exporter'
import { parseJATSArticle } from '../jats-importer'
import { Version } from '../jats-versions'

jest.setTimeout(10000)

const parseXMLWithDTD = (data: string) =>
  parseXml(data, {
    dtdload: true,
    dtdvalid: true,
    nonet: true,
  })

const createIdGenerator = (articleID: string): IDGenerator => {
  const counter = createCounter()

  return (element: Element) => {
    switch (element.nodeName) {
      case 'contrib':
      case 'p':
      case 'ref-list':
      case 'table':
        return null

      case 'ref': {
        const index = String(counter.increment(element.nodeName))

        return `${articleID}-bib-${index.padStart(4, '0')}`
      }

      case 'sec': {
        if (!element.parentNode || element.parentNode.nodeName !== 'body') {
          return null
        }

        const index = String(counter.increment(element.nodeName))

        return `${articleID}-sec${index}`
      }

      case 'fig': {
        const index = String(counter.increment(element.nodeName))

        return `${articleID}-fig-${index.padStart(4, '0')}`
      }

      case 'table-wrap': {
        const index = String(counter.increment(element.nodeName))

        return `${articleID}-tbl-${index.padStart(4, '0')}`
      }

      default: {
        const index = String(counter.increment(element.nodeName))

        return `${articleID}-${element.nodeName}${index}`
      }
    }
  }
}

const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink'

const mediaPathGenerator: MediaPathGenerator = (element, parentID) => {
  const href = element.getAttributeNS(XLINK_NAMESPACE, 'href')

  if (href) {
    const extension = href.split('.').pop()

    if (extension) {
      return `${parentID}.${extension}`
    }
  }

  const mimetype = element.getAttribute('mime-type')
  const mimeSubtype = element.getAttribute('mime-subtype')

  if (mimetype && mimeSubtype) {
    const extension = mime.extension(`${mimetype}/${mimeSubtype}`)

    if (extension) {
      return `${parentID}.${extension}`
    }
  }

  return parentID // TODO: default extension?
}

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('JATS transformer', () => {
  test('round-trips JATS XML', async () => {
    const input = await fs.readFile(
      __dirname + '/data/jats-import.xml',
      'utf-8'
    )

    const doc = new DOMParser().parseFromString(input, 'application/xml')

    // TODO: use doctype of input
    const version =
      doc.querySelector('article')?.getAttribute('dtd-version') || '1.2'

    const models = parseJATSArticle(doc)

    const modelMap = new Map<string, Model>()

    for (const model of models) {
      modelMap.set(model._id, model)
    }

    const decoder = new Decoder(modelMap)
    const article = decoder.createArticleNode()

    const articleID = doc.querySelector(
      'article-id[pub-id-type="publisher-id"]'
    )?.textContent

    const idGenerator = createIdGenerator(articleID as string)

    const exporter = new JATSExporter()
    const output = exporter.serializeToJATS(article.content, modelMap, {
      version: version as Version,
      idGenerator,
      mediaPathGenerator,
    })

    const parsedInput = parseXMLWithDTD(input)
    const parsedOutput = parseXMLWithDTD(output)

    const formattedInput = parsedInput.toString(true)
    const formattedOutput = parsedOutput.toString(true)

    expect(formattedOutput).toBe(formattedInput)

    expect(parsedOutput.errors).toHaveLength(0)
  })
})
