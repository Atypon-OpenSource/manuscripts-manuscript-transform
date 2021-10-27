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

// @ts-ignore
import projectDumpWithCitations from '@manuscripts/examples/data/project-dump-2.json'
// @ts-ignore
import projectDump from '@manuscripts/examples/data/project-dump.json'
import {
  Equation,
  Keyword,
  Manuscript,
  Model,
  MultiGraphicFigureElement,
  ObjectTypes,
  ParagraphElement,
  Section,
} from '@manuscripts/manuscripts-json-schema'
import { Element as XMLElement, parseXml } from 'libxmljs2'

import { journalMeta } from '../../transformer/__tests__/__helpers__/journal-meta'
import { submissions } from '../../transformer/__tests__/__helpers__/submissions'
import { isFigure, isManuscript } from '../../transformer/object-types'
import {
  findManuscript,
  parseProjectBundle,
  ProjectBundle,
} from '../../transformer/project-bundle'
import { JATSExporter } from '../jats-exporter'
import { Version } from '../jats-versions'
import { readFixture } from './files'

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

describe('JATS exporter', () => {
  test('export latest version', async () => {
    const projectBundle = cloneProjectBundle(input)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSExporter()
    const manuscript = findManuscript(modelMap)
    const result = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id
    )

    expect(result).toMatchSnapshot('jats-export')
  })

  test('export v1.1', async () => {
    const projectBundle = cloneProjectBundle(input)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSExporter()
    const manuscript = findManuscript(modelMap)
    const result = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id,
      {
        version: '1.1',
      }
    )

    expect(result).toMatchSnapshot('jats-export-1.1')
  })

  test('export unknown version', async () => {
    const projectBundle = cloneProjectBundle(input)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    await expect(async () => {
      const transformer = new JATSExporter()
      const manuscript = findManuscript(modelMap)
      await transformer.serializeToJATS(doc.content, modelMap, manuscript._id, {
        version: ('1.0' as unknown) as Version,
      })
    }).rejects.toThrow(Error)
  })

  test('move abstract to front by section category', async () => {
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

    const transformer = new JATSExporter()
    const manuscript = findManuscript(modelMap)
    const xml = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id
    )

    const resultDoc = parseXMLWithDTD(xml)

    const result = resultDoc.get('/article/front/article-meta/abstract')

    expect(result).not.toBeNull()
  })

  test('move appendices to back by section category', async () => {
    const projectBundle = cloneProjectBundle(input)

    const model: Section = {
      _id: 'MPSection:123',
      objectType: 'MPSection',
      createdAt: 0,
      updatedAt: 0,
      category: 'MPSectionCategory:appendices',
      title: 'Foo',
      label: 'Bar',
      manuscriptID: 'MPManuscript:1',
      containerID: 'MPProject:1',
      path: ['MPSection:123'],
      sessionID: 'foo',
      priority: 0,
    }

    projectBundle.data.push(model)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSExporter()
    const manuscript = findManuscript(modelMap)
    const xml = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id
    )
    expect(xml).toMatchSnapshot()
  })

  test('move abstract to front by title', async () => {
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

    const transformer = new JATSExporter()
    const manuscript = findManuscript(modelMap)
    const xml = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id
    )

    const resultDoc = parseXMLWithDTD(xml)

    const result = resultDoc.get('/article/front/article-meta/abstract')

    expect(result).not.toBeNull()
  })

  test('handle ID', async () => {
    const projectBundle = cloneProjectBundle(input)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSExporter()
    const manuscript = findManuscript(modelMap)
    const result = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id,
      {
        version: '1.2',
        id: '123',
      }
    )

    expect(result).toMatchSnapshot('jats-export-id')
  })

  test('handle DOI', async () => {
    const projectBundle = cloneProjectBundle(input)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSExporter()
    const manuscript = findManuscript(modelMap)
    const result = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id,
      {
        version: '1.2',
        doi: '10.0000/123',
      }
    )

    expect(result).toMatchSnapshot('jats-export-doi')
  })

  test('add journal ID', async () => {
    const projectBundle = cloneProjectBundle(input)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    for (const submission of submissions) {
      modelMap.set(submission._id, submission)
    }

    const transformer = new JATSExporter()
    const manuscript = findManuscript(modelMap)
    const xml = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id,
      {
        version: '1.2',
        doi: '10.0000/123',
        id: '123',
      }
    )

    expect(xml).toMatchSnapshot('jats-export-submitted')

    const output = parseXMLWithDTD(xml)

    expect(output.get<XMLElement>('//journal-id')!.text()).toBe('bar')
    expect(output.get<XMLElement>('//journal-title')!.text()).toBe('Bar')
    expect(output.get<XMLElement>('//issn')!.text()).toBe('2222-2222')
  })

  test('journal metadata', async () => {
    const projectBundle = cloneProjectBundle(input)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    modelMap.set(journalMeta._id, journalMeta)

    const transformer = new JATSExporter()
    const manuscript = findManuscript(modelMap)
    const xml = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id,
      {
        version: '1.2',
        doi: '10.0000/123',
        id: '123',
      }
    )

    expect(xml).toMatchSnapshot('jats-export-journal-meta')

    const output = parseXMLWithDTD(xml)
    expect(output.errors).toHaveLength(0)
    expect(output.get<XMLElement>('//journal-id')!.text()).toBe('Some id')
    expect(output.get<XMLElement>('//journal-title')!.text()).toBe(
      'journal title'
    )
    expect(output.get<XMLElement>('//issn')!.text()).toBe('123-45')
  })

  test('DTD validation', async () => {
    const projectBundle = cloneProjectBundle(input)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSExporter()
    const manuscript = findManuscript(modelMap)
    const xml = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id
    )

    const { errors } = parseXMLWithDTD(xml)

    expect(errors).toHaveLength(0)
  })

  test('DTD validation: article with title markup and citations', async () => {
    const projectBundle = cloneProjectBundle(inputWithCitations)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSExporter()
    const manuscript = findManuscript(modelMap)
    const xml = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id
    )

    const { errors } = parseXMLWithDTD(xml)

    expect(errors).toHaveLength(0)
  })

  test('DTD validation: with pdf link', async () => {
    const projectBundle = cloneProjectBundle(inputWithCitations)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSExporter()
    const manuscript = findManuscript(modelMap)
    const xml = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id,
      {
        version: '1.2',
        links: { self: { pdf: '123.pdf' } },
      }
    )

    const { errors } = parseXMLWithDTD(xml)

    expect(errors).toHaveLength(0)

    expect(xml).toMatch(/<self-uri content-type="pdf" xlink:href="123.pdf"\/>/)
  })

  test('Export keywords groups', async () => {
    const projectBundle = cloneProjectBundle(input)

    const { doc, modelMap } = parseProjectBundle(projectBundle)
    const keywords = [
      {
        _id: 'MPKeywordGroup:test',
        objectType: 'MPKeywordGroup',
        type: 'author',
        title: 'test title',
        label: 'label',
      },
      {
        _id: 'MPKeyword:test',
        objectType: 'MPKeyword',
        name: 'suicide attempters',
        containedGroup: 'MPKeywordGroup:test',
        priority: 5,
      },
    ]
    const manuscript = findManuscript(modelMap)
    manuscript.keywordIDs = ['MPKeyword:test']

    for (const value of keywords) {
      modelMap.set(value._id, (value as unknown) as Model)
    }
    const transformer = new JATSExporter()
    const xml = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id,
      {
        version: '1.2',
      }
    )

    const { errors } = parseXMLWithDTD(xml)

    expect(errors).toHaveLength(0)

    expect(xml).toMatchSnapshot()
  })

  test('Manuscript Counts', async () => {
    const projectBundle = cloneProjectBundle(input)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const manuscript = findManuscript(modelMap)

    manuscript.wordCount = 41
    manuscript.tableCount = 12
    manuscript.figureCount = 23
    manuscript.genericCounts = [{ countType: 'foo', count: 17 }]
    const transformer = new JATSExporter()
    const xml = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id,
      {
        version: '1.2',
      }
    )

    const { errors } = parseXMLWithDTD(xml)

    expect(errors).toHaveLength(0)

    expect(xml).toMatchSnapshot()
  })

  test('Export link', async () => {
    const projectBundle = cloneProjectBundle(input)

    const id = 'MPParagraphElement:150780D7-CFED-4529-9398-77B5C7625044'

    projectBundle.data = projectBundle.data.map((model) => {
      if (model._id === id) {
        const paragraphElement = model as ParagraphElement

        paragraphElement.contents = paragraphElement.contents.replace(
          /The first section/,
          'The <a href="https://example.com" title="An Example">first</a> section'
        )
      }

      return model
    })

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSExporter()
    const manuscript = findManuscript(modelMap)
    const xml = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id
    )

    const { errors } = parseXMLWithDTD(xml)

    expect(errors).toHaveLength(0)

    const output = parseXMLWithDTD(xml)

    const link = output.get<XMLElement>('//ext-link[@ext-link-type="uri"]')

    expect(link).not.toBeNull()
    expect(link!.text()).toBe('first')

    const attrs: { [key: string]: string } = {}

    for (const attr of link!.attrs()) {
      attrs[attr.name()] = attr.value()
    }

    expect(attrs.href).toBe('https://example.com')
    expect(attrs.title).toBe('An Example')
  })

  test('Export with missing bibliography element', async () => {
    const projectBundle = cloneProjectBundle(input)

    const id = 'MPSection:E07B0D52-9642-4D58-E577-26F8804E3DEE'

    projectBundle.data = projectBundle.data.filter(
      (model) =>
        model.objectType !== ObjectTypes.BibliographyElement && model._id !== id
    )

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSExporter()
    const manuscript = findManuscript(modelMap)
    const xml = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id
    )

    const { errors } = parseXMLWithDTD(xml)

    expect(errors).toHaveLength(0)

    const output = parseXMLWithDTD(xml)

    const refs = output.find('//ref-list/ref')

    expect(refs).toHaveLength(1)
  })

  test('Markup in citations', async () => {
    const projectBundle = cloneProjectBundle(inputWithCitations)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSExporter()
    const manuscript = findManuscript(modelMap)
    const xml = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id
    )

    const output = parseXMLWithDTD(xml)

    const refs = output.find<XMLElement>('//xref[@ref-type="bibr"]')

    expect(refs).toHaveLength(2)

    expect(refs[0].child(0)!.type()).toBe('text')
    expect(refs[0].text()).toBe('1,2')
    expect(refs[1].child(0)!.type()).toBe('text')
    expect(refs[1].text()).toBe('3–5')
  })

  test('Export with empty figure', async () => {
    const projectBundle = cloneProjectBundle(input)

    for (const model of projectBundle.data) {
      if (isFigure(model)) {
        delete model._id
        break
      }
    }

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSExporter()
    const manuscript = findManuscript(modelMap)
    const xml = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id
    )

    const { errors } = parseXMLWithDTD(xml)
    expect(errors).toHaveLength(0)

    const output = parseXMLWithDTD(xml)

    const figures = output.find('//fig')
    expect(figures).toHaveLength(3)

    const figureGroups = output.find('//fig-group')
    expect(figureGroups).toHaveLength(0)
  })

  test('Export manuscript history', async () => {
    const projectBundle = cloneProjectBundle(input)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSExporter()
    const manuscript = findManuscript(modelMap)
    manuscript.revisionRequestDate = 1549312452
    manuscript.correctionDate = 1549312452
    manuscript.revisionReceiveDate = 839335536
    manuscript.acceptanceDate = 1818419713

    const xml = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id,
      {
        version: '1.2',
        doi: '10.1234/5678',
        id: '4567',
        frontMatterOnly: true,
      }
    )
    expect(xml).toMatchSnapshot()

    const { errors } = parseXMLWithDTD(xml)
    expect(errors).toHaveLength(0)
  })

  test('Only export front matter', async () => {
    const projectBundle = cloneProjectBundle(input)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSExporter()
    const manuscript = findManuscript(modelMap)
    const xml = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id,
      {
        version: '1.2',
        doi: '10.1234/5678',
        id: '4567',
        frontMatterOnly: true,
      }
    )

    const { errors } = parseXMLWithDTD(xml)
    expect(errors).toHaveLength(0)

    const output = parseXMLWithDTD(xml)

    const front = output.find('//front')
    expect(front).toHaveLength(1)

    const doi = output.find('//article-id[@pub-id-type="doi"]')
    expect(doi).toHaveLength(1)

    const body = output.find('//body')
    expect(body).toHaveLength(0)

    const back = output.find('//back')
    expect(back).toHaveLength(0)
  })

  test('handle keywords', async () => {
    const projectBundle = cloneProjectBundle(input)

    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const keywords: Keyword[] = [
      {
        _id: 'MPKeyword:1',
        objectType: 'MPKeyword',
        createdAt: 0,
        updatedAt: 0,
        name: 'Foo',
        containerID: 'MPProject:1',
        sessionID: 'foo',
        priority: 0,
      },
      {
        _id: 'MPKeyword:2',
        objectType: 'MPKeyword',
        createdAt: 0,
        updatedAt: 0,
        name: 'Bar',
        containerID: 'MPProject:1',
        sessionID: 'foo',
        priority: 0,
      },
    ]

    for (const keyword of keywords) {
      modelMap.set(keyword._id, keyword)
    }

    const manuscript = Array.from(modelMap.values()).find(
      isManuscript
    ) as Manuscript

    manuscript.keywordIDs = keywords.map((keyword) => keyword._id)

    const transformer = new JATSExporter()
    const xml = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id,
      {
        version: '1.2',
        doi: '10.0000/123',
        id: '123',
      }
    )

    expect(xml).toMatchSnapshot('jats-export-keywords')

    const output = parseXMLWithDTD(xml)

    const kwds = output.find<XMLElement>('//kwd-group/kwd')

    expect(kwds).toHaveLength(2)
    expect(kwds[0]!.text()).toBe('Foo')
    expect(kwds[1]!.text()).toBe('Bar')
  })

  test('DTD validation for MathML representation ', async () => {
    const projectBundle = cloneProjectBundle(input)
    const mathMLFragment = await readFixture('math-fragment.xml')

    projectBundle.data.find((el) => {
      if (el._id === 'MPEquation:C900DDA4-BE45-4AF6-8C9F-CA0AA5FCC403') {
        const equation = el as Equation
        equation.MathMLStringRepresentation = mathMLFragment
        delete equation.TeXRepresentation
      }
    })
    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSExporter()
    const manuscript = findManuscript(modelMap)
    const xml = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id
    )

    const { errors } = parseXMLWithDTD(xml)

    expect(errors).toHaveLength(0)
  })
  test('DTD validation for MultiGraphicFigureElement', async () => {
    const projectBundle = cloneProjectBundle(input)

    const multiGraphicFigureElement: MultiGraphicFigureElement = {
      containerID: '',
      manuscriptID: '',
      sessionID: '',
      containedObjectIDs: [
        'MPFigure:D673DF08-D75E-4061-8EC1-9611EAB302F0',
        'MPFigure:AD65D628-A904-4DC4-A026-F8F4C08F6557',
      ],
      caption: 'Flow chart of participants',
      elementType: 'figure',
      _id: 'MPMultiGraphicFigureElement:multi-graphic-figure-element-1',
      createdAt: 0,
      updatedAt: 0,
      objectType: 'MPMultiGraphicFigureElement',
    }
    projectBundle.data.find((el) => {
      if (el._id === 'MPSection:77786D47-6060-4FBC-BC13-5FA754968D6A') {
        const equation = el as Section
        equation.elementIDs?.push(
          'MPMultiGraphicFigureElement:multi-graphic-figure-element-1'
        )
      }
    })
    projectBundle.data.push(multiGraphicFigureElement)
    const { doc, modelMap } = parseProjectBundle(projectBundle)

    const transformer = new JATSExporter()
    const manuscript = findManuscript(modelMap)
    const xml = await transformer.serializeToJATS(
      doc.content,
      modelMap,
      manuscript._id
    )
    const { errors } = parseXMLWithDTD(xml)

    expect(errors).toHaveLength(0)
  })
})
