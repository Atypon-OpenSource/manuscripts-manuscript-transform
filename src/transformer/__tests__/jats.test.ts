/*!
 * © 2019 Atypon Systems LLC
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

import projectDumpWithCitations from '@manuscripts/examples/data/project-dump-2.json'
import projectDump from '@manuscripts/examples/data/project-dump.json'
import { Section } from '@manuscripts/manuscripts-json-schema'
import { parseXml } from 'libxmljs2'
import { JATSTransformer } from '../jats'
import { parseProjectBundle, ProjectBundle } from '../project-bundle'
import { submissions } from './__helpers__/submissions'

const input = projectDump as ProjectBundle
const inputWithCitations = projectDumpWithCitations as ProjectBundle

const cloneProjectBundle = (input: ProjectBundle): ProjectBundle =>
  JSON.parse(JSON.stringify(input))

const parseXMLWithDTD = (data: string) =>
  parseXml(data, {
    dtdload: true,
    dtdvalid: true,
    nonet: true,
  })

describe('jats', () => {
  test('export latest version', () => {
    const projectBundle = cloneProjectBundle(input)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSTransformer()
    const result = transformer.serializeToJATS(doc.content, modelMap)

    expect(result).toMatchSnapshot('jats-export')
  })

  test('export v1.1', () => {
    const projectBundle = cloneProjectBundle(input)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSTransformer()
    const result = transformer.serializeToJATS(doc.content, modelMap, '1.1')

    expect(result).toMatchSnapshot('jats-export-1.1')
  })

  test('export unknown version', () => {
    const projectBundle = cloneProjectBundle(input)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    expect(() => {
      // @ts-ignore (deliberately invalid)
      serializeToJATS(doc.content, modelMap, '1.0')
    }).toThrow()
  })

  test('move abstract to front by section category', () => {
    const projectBundle = cloneProjectBundle(input)

    const model: Section = {
      _id: 'MPSection:123',
      objectType: 'MPSection',
      createdAt: 0,
      updatedAt: 0,
      category: 'MPSectionCategory:abstract',
      title: 'Foo',
      manuscriptID: 'MPManuscript:1',
      containerID: 'MPProject:1',
      path: ['MPSection:123'],
      sessionID: 'foo',
      priority: 0,
    }

    projectBundle.data.push(model)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSTransformer()
    const xml = transformer.serializeToJATS(doc.content, modelMap)

    const resultDoc = parseXMLWithDTD(xml)

    const result = resultDoc.get('/article/front/article-meta/abstract')

    expect(result).not.toBeNull()
  })

  test('move abstract to front by title', () => {
    const projectBundle = cloneProjectBundle(input)

    const model: Section = {
      _id: 'MPSection:123',
      objectType: 'MPSection',
      createdAt: 0,
      updatedAt: 0,
      category: '',
      title: 'Abstract',
      manuscriptID: 'MPManuscript:1',
      containerID: 'MPProject:1',
      path: ['MPSection:123'],
      sessionID: 'foo',
      priority: 3,
    }

    projectBundle.data.push(model)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSTransformer()
    const xml = transformer.serializeToJATS(doc.content, modelMap)

    const resultDoc = parseXMLWithDTD(xml)

    const result = resultDoc.get('/article/front/article-meta/abstract')

    expect(result).not.toBeNull()
  })

  test('handle ID', () => {
    const projectBundle = cloneProjectBundle(input)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSTransformer()
    const result = transformer.serializeToJATS(
      doc.content,
      modelMap,
      '1.2',
      undefined,
      '123'
    )

    expect(result).toMatchSnapshot('jats-export-id')
  })

  test('handle DOI', () => {
    const projectBundle = cloneProjectBundle(input)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSTransformer()
    const result = transformer.serializeToJATS(
      doc.content,
      modelMap,
      '1.2',
      '10.0000/123'
    )

    expect(result).toMatchSnapshot('jats-export-doi')
  })

  test('add journal ID', () => {
    const projectBundle = cloneProjectBundle(input)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    for (const submission of submissions) {
      modelMap.set(submission._id, submission)
    }

    const transformer = new JATSTransformer()
    const xml = transformer.serializeToJATS(
      doc.content,
      modelMap,
      '1.2',
      '10.0000/123',
      '123'
    )

    expect(xml).toMatchSnapshot('jats-export-submitted')

    const output = parseXMLWithDTD(xml)

    expect(output.get('//journal-id')!.text()).toBe('bar')
    expect(output.get('//journal-title')!.text()).toBe('Bar')
    expect(output.get('//issn')!.text()).toBe('2222-2222')
  })

  test('DTD validation', () => {
    const projectBundle = cloneProjectBundle(input)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSTransformer()
    const xml = transformer.serializeToJATS(doc.content, modelMap)

    const { errors } = parseXMLWithDTD(xml)

    expect(errors).toHaveLength(0)
  })

  test('DTD validation: article with title markup and citations', () => {
    const projectBundle = cloneProjectBundle(inputWithCitations)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSTransformer()
    const xml = transformer.serializeToJATS(doc.content, modelMap)

    const { errors } = parseXMLWithDTD(xml)

    expect(errors).toHaveLength(0)
  })
})
