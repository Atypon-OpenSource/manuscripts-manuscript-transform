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

import { InvalidInput } from '../../errors'
import { ManuscriptNode } from '../../schema'
import { jatsBodyTransformations } from './jats-body-transformations'
import { markComments } from './jats-comments'
import { jatsDOMParser } from './jats-dom-parser'
import { jatsFrontTransformations } from './jats-front-transformations'
import { parseJournal } from './jats-journal-meta-parser'
import { updateDocumentIDs } from './jats-parser-utils'
import { jatsReferenceParser } from './jats-reference-parser'
import { References } from './jats-references'

const parseJATSBody = (
  doc: Document,
  body: Element,
  references: References | undefined
) => {
  const createElement = createElementFn(doc)
  jatsBodyTransformations.ensureSection(body, createElement)
  jatsBodyTransformations.moveCaptionsToEnd(body)
  jatsBodyTransformations.fixTables(body, createElement)
  jatsBodyTransformations.createBody(doc, body, createElement)
  jatsBodyTransformations.createAbstracts(doc, body, createElement)
  jatsBodyTransformations.createBackmatter(doc, body, createElement)
  jatsBodyTransformations.createSuppleMaterials(doc, body, createElement)
  jatsBodyTransformations.createKeywords(doc, body, createElement)
  jatsBodyTransformations.orderTableFootnote(doc, body)
  jatsBodyTransformations.moveReferencesToBackmatter(
    body,
    references,
    createElement
  )
}
const parseJATSFront = (doc: Document, front: Element, template?: string) => {
  const createElement = createElementFn(doc)

  jatsFrontTransformations.setArticleAttrs(doc, template)

  const authorNotes = jatsFrontTransformations.createAuthorNotes(
    doc,
    createElement
  )
  if (authorNotes) {
    doc.documentElement.prepend(authorNotes)
  }
  const affiliations = jatsFrontTransformations.createAffiliations(
    front,
    createElement
  )
  if (affiliations) {
    doc.documentElement.prepend(affiliations)
  }
  const contributors = jatsFrontTransformations.createContributors(
    front,
    createElement
  )
  if (contributors) {
    doc.documentElement.prepend(contributors)
  }
  const title = jatsFrontTransformations.createTitle(front, createElement)
  if (title) {
    doc.documentElement.prepend(title)
  }
  doc.querySelector('front')?.remove()
}

const createElementFn = (doc: Document) => (tagName: string) =>
  doc.createElement(tagName)

export const parseJATSArticle = (doc: Document, template?: string) => {
  const article = doc.querySelector('article')
  const front = doc.querySelector('front')
  const body = doc.querySelector('body')
  const back = doc.querySelector('back')
  if (!article || !front) {
    throw new InvalidInput('invalid JATS format')
  }
  markComments(doc)
  const journal = parseJournal(front.querySelector('journal-meta'))
  const createElement = createElementFn(doc)
  let references
  if (back) {
    references = jatsReferenceParser.parseReferences(
      [...back.querySelectorAll('ref-list > ref')],
      createElement
    )
  }
  const replacements = new Map<string, string>(references?.IDs)
  parseJATSFront(doc, front, template)
  if (body) {
    parseJATSBody(doc, body, references)
  }

  const node = jatsDOMParser.parse(doc).firstChild
  if (!node) {
    throw new Error('No content was parsed from the JATS article body')
  }
  updateDocumentIDs(node, replacements)
  return {
    node: node as ManuscriptNode,
    journal,
  }
}
