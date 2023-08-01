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
import { Element, ObjectTypes } from '@manuscripts/json-schema'

import { coreSections } from '../lib/core-sections'
import { ManuscriptNode, ManuscriptNodeType, schema } from '../schema'

const sectionNodeTypes: ManuscriptNodeType[] = [
  schema.nodes.bibliography_section,
  schema.nodes.footnotes_section,
  schema.nodes.keywords_section,
  schema.nodes.section,
  schema.nodes.toc_section,
]

export const getCoreSectionTitles = (
  sectionCategory: SectionCategory
): string[] => {
  const category = coreSections.find(
    (section) => section._id === sectionCategory
  )
  if (category) {
    return category.titles.length ? category.titles : [' ']
  }
  throw new Error(`${sectionCategory} not found in core sections`)
}

export const isAnySectionNode = (node: ManuscriptNode): boolean =>
  sectionNodeTypes.includes(node.type)

export type SectionCategory =
  | 'MPSectionCategory:abstract'
  | 'MPSectionCategory:abstract-teaser'
  | 'MPSectionCategory:abstract-graphical'
  | 'MPSectionCategory:acknowledgement'
  | 'MPSectionCategory:availability'
  | 'MPSectionCategory:bibliography'
  | 'MPSectionCategory:conclusions'
  | 'MPSectionCategory:discussion'
  | 'MPSectionCategory:endnotes'
  | 'MPSectionCategory:introduction'
  | 'MPSectionCategory:keywords'
  | 'MPSectionCategory:materials-method'
  | 'MPSectionCategory:results'
  | 'MPSectionCategory:toc'
  | 'MPSectionCategory:floating-element'
  | 'MPSectionCategory:appendices'
  | 'MPSectionCategory:competing-interests'
  | 'MPSectionCategory:financial-disclosure'
  | 'MPSectionCategory:con'
  | 'MPSectionCategory:deceased'
  | 'MPSectionCategory:equal'
  | 'MPSectionCategory:present-address'
  | 'MPSectionCategory:presented-at'
  | 'MPSectionCategory:previously-at'
  | 'MPSectionCategory:supplementary-material'
  | 'MPSectionCategory:supported-by'
  | 'MPSectionCategory:ethics-statement'
  | 'MPSectionCategory:body'
  | 'MPSectionCategory:abstracts'
  | 'MPSectionCategory:backmatter'

export type SecType =
  | 'abstract'
  | 'abstract-teaser'
  | 'abstract-graphical'
  | 'acknowledgments'
  | 'availability'
  | 'bibliography'
  | 'conclusions'
  | 'data-availability'
  | 'discussion'
  | 'endnotes'
  | 'intro'
  | 'keywords'
  | 'materials'
  | 'methods'
  | 'results'
  | 'toc'
  | 'floating-element'
  | 'appendices'
  | 'competing-interests'
  | 'financial-disclosure'
  | 'con'
  | 'deceased'
  | 'equal'
  | 'present-address'
  | 'presented-at'
  | 'previously-at'
  | 'supplementary-material'
  | 'supported-by'
  | 'ethics-statement'
  | 'abstracts'
  | 'body'
  | 'backmatter'

export const chooseSectionNodeType = (
  category?: SectionCategory
): ManuscriptNodeType => {
  switch (category) {
    case 'MPSectionCategory:bibliography':
      return schema.nodes.bibliography_section

    case 'MPSectionCategory:abstract-graphical':
      return schema.nodes.graphical_abstract_section

    case 'MPSectionCategory:endnotes':
      return schema.nodes.footnotes_section

    case 'MPSectionCategory:keywords':
      return schema.nodes.keywords_section

    case 'MPSectionCategory:toc':
      return schema.nodes.toc_section

    default:
      return schema.nodes.section
  }
}

export const chooseSectionLableName = (type?: SecType): string => {
  switch (type) {
    case 'appendices':
      return 'Appendix'
    default:
      return type as string
  }
}

// deprecated, every custom section should have a category
export const guessSectionCategory = (
  elements: Element[]
): SectionCategory | undefined => {
  if (!elements.length) {
    return undefined
  }

  switch (elements[0].objectType) {
    case ObjectTypes.BibliographyElement:
      return 'MPSectionCategory:bibliography'

    case ObjectTypes.FootnotesElement:
      return 'MPSectionCategory:endnotes'

    case ObjectTypes.KeywordsElement:
      return 'MPSectionCategory:keywords'

    case ObjectTypes.TOCElement:
      return 'MPSectionCategory:toc'

    default:
      return undefined
  }
}

export const buildSectionCategory = (
  node: ManuscriptNode
): SectionCategory | undefined => {
  switch (node.type) {
    case schema.nodes.bibliography_section:
      return 'MPSectionCategory:bibliography'

    case schema.nodes.footnotes_section:
      return 'MPSectionCategory:endnotes'

    case schema.nodes.keywords_section:
      return 'MPSectionCategory:keywords'

    case schema.nodes.toc_section:
      return 'MPSectionCategory:toc'

    case schema.nodes.graphical_abstract_section:
      return 'MPSectionCategory:abstract-graphical'

    default:
      return node.attrs.category || undefined
  }
}

export const chooseJatsFnType = (footnoteType: string): string => {
  switch (footnoteType) {
    case 'competing-interests':
      return 'coi-statement'

    default:
      return footnoteType
  }
}

// https://jats.nlm.nih.gov/archiving/tag-library/1.2/attribute/sec-type.html
export const chooseSecType = (sectionCategory: SectionCategory): SecType => {
  const [, suffix] = sectionCategory.split(':', 2)

  switch (suffix) {
    case 'acknowledgement':
      return 'acknowledgments'

    case 'introduction':
      return 'intro'

    case 'materials-method':
      return 'methods'

    default:
      return suffix as SecType
  }
}

export const chooseSectionCategoryByType = (
  secType: string
): SectionCategory | undefined => {
  switch (secType) {
    case 'abstract':
      return 'MPSectionCategory:abstract'

    case 'abstract-teaser':
      return 'MPSectionCategory:abstract-teaser'

    case 'abstract-graphical':
      return 'MPSectionCategory:abstract-graphical'

    case 'acknowledgments':
      return 'MPSectionCategory:acknowledgement'

    case 'availability':
    case 'data-availability':
      return 'MPSectionCategory:availability'

    case 'bibliography':
      return 'MPSectionCategory:bibliography'

    case 'conclusions':
      return 'MPSectionCategory:conclusions'

    case 'discussion':
      return 'MPSectionCategory:discussion'

    case 'endnotes':
      return 'MPSectionCategory:endnotes'

    case 'intro':
      return 'MPSectionCategory:introduction'

    case 'keywords':
      return 'MPSectionCategory:keywords'

    case 'materials':
    case 'methods':
      return 'MPSectionCategory:materials-method'

    case 'results':
      return 'MPSectionCategory:results'

    case 'toc':
      return 'MPSectionCategory:toc'

    case 'floating-element':
      return 'MPSectionCategory:floating-element'
    case 'appendices':
      return 'MPSectionCategory:appendices'
    case 'competing-interests':
    case 'conflict':
      return 'MPSectionCategory:competing-interests'
    case 'financial-disclosure':
      return 'MPSectionCategory:financial-disclosure'
    case 'con':
      return 'MPSectionCategory:con'
    case 'deceased':
      return 'MPSectionCategory:deceased'
    case 'equal':
      return 'MPSectionCategory:equal'
    case 'present-address':
      return 'MPSectionCategory:present-address'
    case 'presented-at':
      return 'MPSectionCategory:presented-at'
    case 'previously-at':
      return 'MPSectionCategory:previously-at'
    case 'supplementary-material':
      return 'MPSectionCategory:supplementary-material'
    case 'supported-by':
      return 'MPSectionCategory:supported-by'
    case 'ethics-statement':
      return 'MPSectionCategory:ethics-statement'
    case 'body':
      return 'MPSectionCategory:body'
    case 'backmatter':
      return 'MPSectionCategory:backmatter'
    case 'abstracts':
      return 'MPSectionCategory:abstracts'
    default:
      return undefined
  }
}

export const chooseSectionCategory = (
  section: HTMLElement
): SectionCategory | undefined => {
  const secType = section.getAttribute('sec-type') as SecType
  const secCat = chooseSectionCategoryByType(secType)
  if (secCat) {
    return secCat
  } else {
    const titleNode = section.firstElementChild

    if (titleNode && titleNode.nodeName === 'title' && titleNode.textContent) {
      return chooseSectionCategoryFromTitle(
        titleNode.textContent.trim().toLowerCase()
      )
    }

    return undefined
  }
}

export const chooseSectionCategoryFromTitle = (
  title: string | null
): SectionCategory | undefined => {
  if (!title) {
    return undefined
  }

  switch (title) {
    case 'abstract':
      return 'MPSectionCategory:abstract'

    case 'acknowledgments':
    case 'acknowledgements':
      return 'MPSectionCategory:acknowledgement'

    case 'availability':
    case 'data availability':
      return 'MPSectionCategory:availability'

    case 'conclusions':
      return 'MPSectionCategory:conclusions'

    case 'discussion':
      return 'MPSectionCategory:discussion'

    case 'introduction':
      return 'MPSectionCategory:introduction'

    case 'methods':
    case 'materials':
    case 'materials and methods':
    case 'materials & methods':
      return 'MPSectionCategory:materials-method'

    case 'results':
      return 'MPSectionCategory:results'

    case 'bibliography':
    case 'references':
      return 'MPSectionCategory:bibliography'

    case 'conflict':
    case 'conflict of interest':
    case 'competing interests':
      return 'MPSectionCategory:competing-interests'

    case 'financial-disclosure':
    case 'funding information':
      return 'MPSectionCategory:financial-disclosure'
  }
}
