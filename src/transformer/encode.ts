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

import {
  BibliographyElement,
  Equation,
  EquationElement,
  Figure,
  FigureElement,
  Footnote,
  FootnotesElement,
  InlineMathFragment,
  KeywordsElement,
  ListElement,
  Listing,
  ListingElement,
  Model,
  ObjectTypes,
  ParagraphElement,
  QuoteElement,
  Section,
  Table,
  TableElement,
  TOCElement,
} from '@manuscripts/manuscripts-json-schema'
import { DOMSerializer } from 'prosemirror-model'
import serializeToXML from 'w3c-xmlserializer'

import { iterateChildren } from '../lib/utils'
import {
  isHighlightMarkerNode,
  isSectionNode,
  ManuscriptNode,
  ManuscriptNodeType,
  Nodes,
  schema,
  TableElementNode,
} from '../schema'
import {
  extractHighlightMarkers,
  isHighlightableModel,
} from './highlight-markers'
import { PlaceholderElement } from './models'
import { nodeTypesMap } from './node-types'
import { buildSectionCategory } from './section-category'

const serializer = DOMSerializer.fromSchema(schema)

const contents = (node: ManuscriptNode): string => {
  const output = serializer.serializeNode(node) as HTMLElement

  return serializeToXML(output)
}

export const inlineContents = (node: ManuscriptNode): string =>
  (serializer.serializeNode(node) as HTMLElement).innerHTML

export const inlineText = (node: ManuscriptNode): string => {
  const text = (serializer.serializeNode(node) as HTMLElement).textContent

  return text === null ? '' : text
}

const listContents = (node: ManuscriptNode): string => {
  const output = serializer.serializeNode(node) as HTMLElement

  for (const p of output.querySelectorAll('li > p')) {
    const parent = p.parentNode as HTMLLIElement

    while (p.firstChild) {
      parent.insertBefore(p.firstChild, p)
    }

    parent.removeChild(p)
  }

  return serializeToXML(output)
}

const svgDefs = (svg: string): string | undefined => {
  const template = document.createElement('template')
  template.innerHTML = svg.trim()

  const defs = template.content.querySelector('defs')

  return defs ? serializeToXML(defs) : undefined
}

const tableRowDisplayStyle = (tagName: string, parent: ManuscriptNode) => {
  switch (tagName) {
    case 'thead':
      return parent.attrs.suppressHeader ? 'none' : 'table-header-group'

    case 'tfoot':
      return parent.attrs.suppressFooter ? 'none' : 'table-footer-group'

    default:
      return null
  }
}

const buildTableSection = (
  tagName: string,
  inputRows: HTMLTableRowElement[],
  parent: ManuscriptNode
): HTMLTableSectionElement => {
  const section = document.createElement(tagName) as HTMLTableSectionElement

  for (const sectionRow of inputRows) {
    const row = section.appendChild(document.createElement('tr'))

    for (const child of sectionRow.children) {
      const cellType = tagName === 'thead' ? 'th' : 'td'

      const cell = row.appendChild(document.createElement(cellType))

      while (child.firstChild) {
        cell.appendChild(child.firstChild)
      }

      for (const attribute of child.attributes) {
        cell.setAttribute(attribute.name, attribute.value)
      }
    }
  }

  const displayStyle = tableRowDisplayStyle(tagName, parent)

  if (displayStyle) {
    section.style.display = displayStyle
  }

  return section
}

const tableContents = (
  node: ManuscriptNode,
  parent: TableElementNode
): string => {
  const input = serializer.serializeNode(node) as HTMLTableElement

  const output = document.createElement('table')

  output.setAttribute('id', parent.attrs.id)

  output.classList.add('MPElement')

  if (parent.attrs.tableStyle) {
    output.classList.add(parent.attrs.tableStyle.replace(/:/g, '_'))
  }

  if (parent.attrs.paragraphStyle) {
    output.classList.add(parent.attrs.paragraphStyle.replace(/:/g, '_'))
  }

  output.setAttribute('data-contained-object-id', node.attrs.id)

  const rows = Array.from(input.querySelectorAll('tr'))

  const thead = rows.splice(0, 1)
  const tfoot = rows.splice(-1, 1)

  output.appendChild(buildTableSection('thead', thead, parent))
  output.appendChild(buildTableSection('tbody', rows, parent))
  output.appendChild(buildTableSection('tfoot', tfoot, parent))

  return serializeToXML(output)
}

const elementContents = (node: ManuscriptNode): string => {
  const input = serializer.serializeNode(node) as HTMLDivElement

  input.classList.add('MPElement')

  if (node.attrs.paragraphStyle) {
    input.classList.add(node.attrs.paragraphStyle.replace(/:/g, '_'))
  }

  if (node.attrs.id) {
    input.setAttribute('id', node.attrs.id)
  }

  return serializeToXML(input)
}

const childElements = (node: ManuscriptNode): ManuscriptNode[] => {
  const nodes: ManuscriptNode[] = []

  node.forEach((childNode) => {
    if (!isSectionNode(childNode)) {
      nodes.push(childNode)
    }
  })

  return nodes
}

const attributeOfNodeType = (
  node: ManuscriptNode,
  type: string,
  attribute: string
): string => {
  for (const child of iterateChildren(node)) {
    if (child.type.name === type) {
      return child.attrs[attribute]
    }
  }

  return ''
}

const inlineContentsOfNodeType = (
  node: ManuscriptNode,
  nodeType: ManuscriptNodeType
): string => {
  for (let i = 0; i < node.childCount; i++) {
    const child = node.child(i)

    if (child.type === nodeType) {
      return inlineContents(child)
    }
  }

  return ''
}

const containedFigureIDs = (node: ManuscriptNode): string[] => {
  const figureNodeType = node.type.schema.nodes.figure

  const ids: string[] = []

  for (let i = 0; i < node.childCount; i++) {
    const childNode = node.child(i)

    if (childNode.type === figureNodeType) {
      ids.push(childNode.attrs.id)
    }
  }

  return ids
}

type NodeEncoder = (
  node: ManuscriptNode,
  parent: ManuscriptNode,
  path: string[],
  priority: PrioritizedValue
) => Partial<Model>

type NodeEncoderMap = { [key in Nodes]?: NodeEncoder }

const encoders: NodeEncoderMap = {
  bibliography_element: (node): Partial<BibliographyElement> => ({
    elementType: 'div',
    contents: contents(node),
    paragraphStyle: node.attrs.paragraphStyle || undefined,
  }),
  bibliography_section: (node, parent, path, priority): Partial<Section> => ({
    category: buildSectionCategory(node),
    priority: priority.value++,
    title: inlineContentsOfNodeType(node, node.type.schema.nodes.section_title),
    path: path.concat([node.attrs.id]),
    elementIDs: childElements(node)
      .map((childNode) => childNode.attrs.id)
      .filter((id) => id),
  }),
  blockquote_element: (node): Partial<QuoteElement> => ({
    contents: contents(node),
    elementType: 'div',
    paragraphStyle: node.attrs.paragraphStyle || undefined,
    placeholderInnerHTML: node.attrs.placeholder || '',
    quoteType: 'block',
  }),
  bullet_list: (node): Partial<ListElement> => ({
    elementType: 'ul',
    contents: listContents(node),
    paragraphStyle: node.attrs.paragraphStyle || undefined,
  }),
  listing: (node): Partial<Listing> => ({
    contents: inlineText(node),
    language: node.attrs.language || undefined,
    languageKey: node.attrs.languageKey || 'null', // TODO: remove this?
  }),
  listing_element: (node): Partial<ListingElement> => ({
    containedObjectID: attributeOfNodeType(node, 'listing', 'id'),
    caption: inlineContentsOfNodeType(node, node.type.schema.nodes.figcaption),
    elementType: 'figure',
    suppressCaption: node.attrs.suppressCaption === true ? undefined : false,
  }),
  equation: (node): Partial<Equation> => ({
    MathMLStringRepresentation:
      node.attrs.MathMLStringRepresentation || undefined,
    TeXRepresentation: node.attrs.TeXRepresentation,
    SVGStringRepresentation: node.attrs.SVGStringRepresentation,
    // title: 'Equation',
  }),
  equation_element: (node): Partial<EquationElement> => ({
    containedObjectID: attributeOfNodeType(node, 'equation', 'id'),
    caption: inlineContentsOfNodeType(node, node.type.schema.nodes.figcaption),
    elementType: 'p',
    suppressCaption: Boolean(node.attrs.suppressCaption) || undefined,
  }),
  figure: (node): Partial<Figure> => ({
    title:
      inlineContentsOfNodeType(node, node.type.schema.nodes.figcaption) ||
      undefined,
    contentType: node.attrs.contentType || undefined,
    embedURL: node.attrs.embedURL || undefined,
    originalURL: node.attrs.originalURL || undefined,
    listingAttachment: node.attrs.listingAttachment || undefined,
  }),
  figure_element: (node): Partial<FigureElement> => ({
    containedObjectIDs: containedFigureIDs(node),
    caption: inlineContentsOfNodeType(node, node.type.schema.nodes.figcaption),
    elementType: 'figure',
    listingID: attributeOfNodeType(node, 'listing', 'id') || undefined,
    alignment: node.attrs.alignment || undefined,
    sizeFraction: node.attrs.sizeFraction || undefined,
    suppressCaption: Boolean(node.attrs.suppressCaption) || undefined,
    figureStyle: node.attrs.figureStyle || undefined,
    figureLayout: node.attrs.figureLayout || undefined,
  }),
  footnote: (node, parent): Partial<Footnote> => ({
    containingObject: parent.attrs.id,
    contents: contents(node),
  }),
  footnotes_element: (node): Partial<FootnotesElement> => ({
    contents: contents(node),
    // elementType: 'div', // TODO: https://gitlab.com/mpapp-private/manuscripts-json-schema/issues/47
    paragraphStyle: node.attrs.paragraphStyle || undefined,
  }),
  inline_equation: (node, parent): Partial<InlineMathFragment> => ({
    containingObject: parent.attrs.id,
    // MathMLRepresentation: node.attrs.MathMLRepresentation || undefined,
    TeXRepresentation: node.attrs.TeXRepresentation,
    SVGRepresentation: node.attrs.SVGRepresentation,
    SVGGlyphs: svgDefs(node.attrs.SVGRepresentation),
  }),
  keywords_element: (node): Partial<KeywordsElement> => ({
    contents: elementContents(node),
    elementType: 'div',
    paragraphStyle: node.attrs.paragraphStyle || undefined,
  }),
  keywords_section: (node, parent, path, priority): Partial<Section> => ({
    category: buildSectionCategory(node),
    priority: priority.value++,
    title: inlineContentsOfNodeType(node, node.type.schema.nodes.section_title),
    path: path.concat([node.attrs.id]),
    elementIDs: childElements(node)
      .map((childNode) => childNode.attrs.id)
      .filter((id) => id),
  }),
  ordered_list: (node): Partial<ListElement> => ({
    elementType: 'ol',
    contents: listContents(node),
    paragraphStyle: node.attrs.paragraphStyle || undefined,
  }),
  paragraph: (node): Partial<ParagraphElement> => ({
    elementType: 'p',
    contents: contents(node), // TODO: can't serialize citations?
    paragraphStyle: node.attrs.paragraphStyle || undefined,
    placeholderInnerHTML: node.attrs.placeholder || '',
  }),
  placeholder_element: (): Partial<PlaceholderElement> => ({
    elementType: 'p',
  }),
  pullquote_element: (node): Partial<QuoteElement> => ({
    contents: contents(node),
    elementType: 'div',
    paragraphStyle: node.attrs.paragraphStyle || undefined,
    placeholderInnerHTML: node.attrs.placeholder || '',
    quoteType: 'pull',
  }),
  section: (node, parent, path, priority): Partial<Section> => ({
    category: buildSectionCategory(node),
    priority: priority.value++,
    title: inlineContentsOfNodeType(node, node.type.schema.nodes.section_title),
    path: path.concat([node.attrs.id]),
    elementIDs: childElements(node)
      .map((childNode) => childNode.attrs.id)
      .filter((id) => id),
    titleSuppressed: node.attrs.titleSuppressed || undefined,
    pageBreakStyle: node.attrs.pageBreakStyle || undefined,
  }),
  table: (node, parent): Partial<Table> => ({
    contents: tableContents(node, parent as TableElementNode),
    listingAttachment: node.attrs.listingAttachment || undefined,
  }),
  table_element: (node): Partial<TableElement> => ({
    containedObjectID: attributeOfNodeType(node, 'table', 'id'),
    caption: inlineContentsOfNodeType(node, node.type.schema.nodes.figcaption),
    elementType: 'table',
    listingID: attributeOfNodeType(node, 'listing', 'id') || undefined,
    paragraphStyle: node.attrs.paragraphStyle || undefined,
    suppressCaption: Boolean(node.attrs.suppressCaption) || undefined,
    suppressFooter: Boolean(node.attrs.suppressFooter) || undefined,
    suppressHeader: Boolean(node.attrs.suppressHeader) || undefined,
    tableStyle: node.attrs.tableStyle || undefined,
  }),
  toc_element: (node): Partial<TOCElement> => ({
    contents: elementContents(node),
    elementType: 'div',
    paragraphStyle: node.attrs.paragraphStyle || undefined,
  }),
  toc_section: (node, parent, path, priority): Partial<Section> => ({
    category: buildSectionCategory(node),
    priority: priority.value++,
    title: inlineContentsOfNodeType(node, node.type.schema.nodes.section_title),
    path: path.concat([node.attrs.id]),
    elementIDs: childElements(node)
      .map((childNode) => childNode.attrs.id)
      .filter((id) => id),
  }),
}

const modelData = (
  node: ManuscriptNode,
  parent: ManuscriptNode,
  path: string[],
  priority: PrioritizedValue
): Partial<Model> => {
  const encoder = encoders[node.type.name as Nodes]

  if (!encoder) {
    throw new Error(`Unhandled model: ${node.type.name}`)
  }

  return encoder(node, parent, path, priority)
}

export const modelFromNode = (
  node: ManuscriptNode,
  parent: ManuscriptNode,
  path: string[],
  priority: PrioritizedValue
): Model => {
  // TODO: in handlePaste, filter out non-standard IDs

  const data = {
    ...modelData(node, parent, path, priority),
    _id: node.attrs.id,
    objectType: nodeTypesMap.get(node.type) as ObjectTypes,
  }

  const model = data as Model

  if (isHighlightableModel(model)) {
    extractHighlightMarkers(model)
  }

  return model
}

interface PrioritizedValue {
  value: number
}

export const encode = (node: ManuscriptNode): Map<string, Model> => {
  const models: Map<string, Model> = new Map()

  const priority: PrioritizedValue = {
    value: 1,
  }

  const placeholders = ['placeholder', 'placeholder_element']

  // TODO: parents array, to get closest parent with an id for containingObject
  const addModel = (path: string[], parent: ManuscriptNode) => (
    child: ManuscriptNode
  ) => {
    if (!child.attrs.id) {
      return
    }
    if (isHighlightMarkerNode(child)) {
      return
    }
    if (placeholders.includes(child.type.name)) {
      return
    }

    const model = modelFromNode(child, parent, path, priority)
    models.set(model._id, model)

    child.forEach(addModel(path.concat(child.attrs.id), child))
  }

  node.forEach(addModel([], node))

  return models
}
