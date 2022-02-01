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

import { ObjectTypes } from '@manuscripts/manuscripts-json-schema'

import {
  GROUP_ELEMENT,
  GROUP_EXECUTABLE,
  GROUP_SECTION,
  hasGroup,
  ManuscriptNode,
  ManuscriptNodeType,
  Nodes,
  schema,
} from '../schema'

export const nodeTypesMap: Map<ManuscriptNodeType, ObjectTypes> = new Map([
  [schema.nodes.bibliography_element, ObjectTypes.BibliographyElement],
  [schema.nodes.bibliography_section, ObjectTypes.Section],
  [schema.nodes.blockquote_element, ObjectTypes.QuoteElement],
  [schema.nodes.bullet_list, ObjectTypes.ListElement],
  [schema.nodes.citation, ObjectTypes.Citation],
  [schema.nodes.cross_reference, ObjectTypes.AuxiliaryObjectReference],
  [schema.nodes.equation, ObjectTypes.Equation],
  [schema.nodes.equation_element, ObjectTypes.EquationElement],
  [schema.nodes.figure, ObjectTypes.Figure],
  [
    schema.nodes.multi_graphic_figure_element,
    ObjectTypes.MultiGraphicFigureElement,
  ],
  [schema.nodes.figure_element, ObjectTypes.FigureElement],
  [schema.nodes.footnote, ObjectTypes.Footnote],
  [schema.nodes.footnotes_element, ObjectTypes.FootnotesElement],
  [schema.nodes.footnotes_section, ObjectTypes.Section],
  [schema.nodes.graphical_abstract_section, ObjectTypes.Section],
  [schema.nodes.highlight_marker, ObjectTypes.HighlightMarker],
  [schema.nodes.inline_equation, ObjectTypes.InlineMathFragment],
  [schema.nodes.keywords_element, ObjectTypes.KeywordsElement],
  [schema.nodes.keywords_section, ObjectTypes.Section],
  [schema.nodes.listing, ObjectTypes.Listing],
  [schema.nodes.listing_element, ObjectTypes.ListingElement],
  [schema.nodes.manuscript, ObjectTypes.Manuscript],
  [schema.nodes.ordered_list, ObjectTypes.ListElement],
  [schema.nodes.paragraph, ObjectTypes.ParagraphElement],
  [schema.nodes.pullquote_element, ObjectTypes.QuoteElement],
  [schema.nodes.section, ObjectTypes.Section],
  [schema.nodes.table, ObjectTypes.Table],
  [schema.nodes.table_element, ObjectTypes.TableElement],
  [schema.nodes.toc_element, ObjectTypes.TOCElement],
  [schema.nodes.toc_section, ObjectTypes.Section],
])

export const isExecutableNodeType = (type: ManuscriptNodeType) =>
  hasGroup(type, GROUP_EXECUTABLE)

export const isElementNodeType = (type: ManuscriptNodeType) =>
  hasGroup(type, GROUP_ELEMENT)

export const isSectionNodeType = (type: ManuscriptNodeType) =>
  hasGroup(type, GROUP_SECTION)

export const isNodeType = <T extends ManuscriptNode>(
  node: ManuscriptNode,
  type: Nodes
): node is T => node.type === node.type.schema.nodes[type]
