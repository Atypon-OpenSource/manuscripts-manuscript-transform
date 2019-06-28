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
  Affiliation,
  Citation,
  Contributor,
  Model,
  ObjectTypes,
} from '@manuscripts/manuscripts-json-schema'
import { DOMOutputSpec, DOMSerializer } from 'prosemirror-model'
import {
  CitationNode,
  CrossReferenceNode,
  FigureNode,
  ListingNode,
  ManuscriptFragment,
  ManuscriptMark,
  ManuscriptNode,
  Marks,
  Nodes,
  schema,
} from '../schema'
import { generateAttachmentFilename } from './filename'
import { AuxiliaryObjectReference } from './models'
import { isNodeType } from './node-types'
import { hasObjectType } from './object-types'
import { findManuscript } from './project-bundle'
import { xmlSerializer } from './serializer'

export class HTMLTransformer {
  private document: Document
  private modelMap: Map<string, Model>

  public serializeToHTML = (
    fragment: ManuscriptFragment,
    modelMap: Map<string, Model>,
    attachmentUrlPrefix: string = 'Data/'
  ) => {
    this.modelMap = modelMap

    this.document = document.implementation.createDocument(
      'http://www.w3.org/1999/xhtml',
      'html',
      document.implementation.createDocumentType('html', '', '')
    )

    const article = this.document.createElement('article')
    this.document.documentElement.appendChild(article)

    article.appendChild(this.buildFront())
    article.appendChild(this.buildBody(fragment))
    // article.appendChild(this.buildBack())

    this.fixBody(fragment, attachmentUrlPrefix)

    return xmlSerializer.serializeToString(this.document)
  }

  private buildFront = () => {
    // at this point we assume that there is only one manuscript - resources
    // associated with others should have been stripped out via parseProjectBundle
    const manuscript = findManuscript(this.modelMap)

    if (!manuscript) {
      throw new Error('Manuscript not found in project modelMap')
    }

    const front = this.document.createElement('header')

    const articleMeta = this.document.createElement('div')
    front.appendChild(articleMeta)

    const articleTitle = this.document.createElement('h1')
    if (manuscript.title) {
      articleTitle.innerHTML = manuscript.title
    }
    articleMeta.appendChild(articleTitle)

    const contributors = Array.from(this.modelMap.values()).filter(
      hasObjectType<Contributor>(ObjectTypes.Contributor)
    )

    if (contributors && contributors.length) {
      const contribGroup = this.document.createElement('div')
      contribGroup.classList.add('contrib-group')
      articleMeta.appendChild(contribGroup)

      contributors.sort((a, b) => Number(a.priority) - Number(b.priority))

      contributors.forEach(contributor => {
        const contrib = this.document.createElement('span')
        contrib.setAttribute('id', contributor._id)

        if (contributor.isCorresponding) {
          contrib.setAttribute('data-corresp', 'yes')
        }

        const name = this.document.createElement('span')
        name.classList.add('contrib-name')
        contrib.appendChild(name)

        if (contributor.bibliographicName.given) {
          const givenNames = this.document.createElement('span')
          givenNames.classList.add('contrib-given-names')
          givenNames.textContent = contributor.bibliographicName.given
          name.appendChild(givenNames)
        }

        if (contributor.bibliographicName.family) {
          const surname = this.document.createElement('span')
          surname.classList.add('contrib-surname')
          surname.textContent = contributor.bibliographicName.family
          name.appendChild(surname)
        }

        // if (contributor.email) {
        //   const email = this.document.createElement('a')
        //   email.href = `mailto:${contributor.email}`
        //   contrib.appendChild(email)
        // }

        // TODO: link to affiliations

        contribGroup.appendChild(contrib)
      })
    }

    const affiliations = Array.from(this.modelMap.values()).filter(
      hasObjectType<Affiliation>(ObjectTypes.Affiliation)
    )

    // TODO: sort affiliations

    if (affiliations && affiliations.length) {
      const affiliationList = this.document.createElement('ol')
      affiliationList.classList.add('affiliations-list')
      articleMeta.appendChild(affiliationList)

      affiliations.forEach(affiliation => {
        const affiliationItem = this.document.createElement('li')
        affiliationItem.classList.add('affiliation-list-item')
        affiliationItem.setAttribute('id', affiliation._id)

        // TODO: all the institution fields
        if (affiliation.institution) {
          affiliationItem.textContent = affiliation.institution
        }

        affiliationList.appendChild(affiliationItem)
      })
    }

    return front
  }

  private buildBody = (fragment: ManuscriptFragment) => {
    const getModel = <T extends Model>(id?: string) =>
      id ? (this.modelMap.get(id) as T | undefined) : undefined

    const nodes: { [key: string]: (node: ManuscriptNode) => DOMOutputSpec } = {}

    for (const [name, node] of Object.entries(schema.nodes)) {
      if (node.spec.toDOM) {
        nodes[name as Nodes] = node.spec.toDOM
      }
    }

    nodes.citation = node => {
      const citationNode = node as CitationNode

      const element = this.document.createElement('span')
      element.setAttribute('class', 'citation')

      const citation = getModel<Citation>(citationNode.attrs.rid)

      if (citation) {
        element.setAttribute(
          'data-reference-ids',
          citation.embeddedCitationItems
            .map(item => item.bibliographyItem)
            .join(' ')
        )
      }

      if (citationNode.attrs.contents) {
        element.innerHTML = citationNode.attrs.contents
      }

      return element
    }

    nodes.cross_reference = node => {
      const crossReferenceNode = node as CrossReferenceNode

      const element = this.document.createElement('a')
      element.classList.add('cross-reference')

      const auxiliaryObjectReference = getModel<AuxiliaryObjectReference>(
        crossReferenceNode.attrs.rid
      )

      if (auxiliaryObjectReference) {
        element.setAttribute(
          'href',
          `#${auxiliaryObjectReference.referencedObject}`
        )
      }

      element.textContent = crossReferenceNode.attrs.label

      return element
    }

    nodes.listing = node => {
      const listingNode = node as ListingNode

      const pre = this.document.createElement('pre')
      if (listingNode.attrs.id) {
        pre.setAttribute('id', listingNode.attrs.id)
      }
      pre.classList.add('listing')

      const code = this.document.createElement('code')
      if (listingNode.attrs.languageKey) {
        code.setAttribute('data-language', listingNode.attrs.languageKey)
      }
      code.textContent = listingNode.attrs.contents
      pre.appendChild(code)

      return pre
    }

    nodes.text = node => node.text!

    const marks: {
      [key: string]: (mark: ManuscriptMark, inline: boolean) => DOMOutputSpec
    } = {}

    for (const [name, mark] of Object.entries(schema.marks)) {
      if (mark.spec.toDOM) {
        marks[name as Marks] = mark.spec.toDOM
      }
    }

    const serializer = new DOMSerializer(nodes, marks)

    return serializer.serializeFragment(fragment, { document })
  }

  // private buildBack = (document: Document) => {
  //   const back = this.document.createElement('footer')
  //
  //   // TODO: reference list
  //
  //   return back
  // }

  private idSelector = (id: string) => '#' + id.replace(/:/g, '\\:')

  private fixFigure = (node: FigureNode, attachmentUrlPrefix: string) => {
    const figure = this.document.getElementById(node.attrs.id)

    if (figure) {
      const filename = generateAttachmentFilename(
        node.attrs.id,
        node.attrs.contentType
      )

      const img = this.document.createElement('img')
      img.setAttribute('src', attachmentUrlPrefix + filename)
      figure.insertBefore(img, figure.firstChild)
    }
  }

  private fixBody = (
    fragment: ManuscriptFragment,
    attachmentUrlPrefix: string
  ) => {
    // tslint:disable-next-line:cyclomatic-complexity
    fragment.descendants(node => {
      if (node.attrs.id) {
        if (node.attrs.titleSuppressed) {
          const selector = this.idSelector(node.attrs.id)

          const title = this.document.querySelector(`${selector} > h1`)

          if (title && title.parentNode) {
            title.parentNode.removeChild(title)
          }
        }

        if (node.attrs.suppressCaption) {
          const selector = this.idSelector(node.attrs.id)

          // TODO: need to query deeper?
          const caption = this.document.querySelector(
            `${selector} > figcaption`
          )

          if (caption && caption.parentNode) {
            caption.parentNode.removeChild(caption)
          }
        }

        if (isNodeType<FigureNode>(node, 'figure')) {
          this.fixFigure(node, attachmentUrlPrefix)
        }
      }
    })
  }
}
