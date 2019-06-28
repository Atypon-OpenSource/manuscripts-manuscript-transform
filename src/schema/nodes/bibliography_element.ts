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

import { NodeSpec } from 'prosemirror-model'
import { nodeFromHTML } from '../../lib/html'
import { ManuscriptNode } from '../types'

interface Attrs {
  id: string
  contents: string
}

export interface BibliographyElementNode extends ManuscriptNode {
  attrs: Attrs
}

const createBodyElement = (node: BibliographyElementNode) => {
  const dom = document.createElement('div')
  dom.className = 'csl-bib-body'
  dom.id = node.attrs.id

  return dom
}

export const bibliographyElement: NodeSpec = {
  atom: true,
  attrs: {
    id: { default: '' },
    contents: { default: '' },
    placeholder: {
      default:
        'Citations inserted to the manuscript will be formatted here as a bibliography.',
    },
  },
  selectable: false,
  group: 'block',
  parseDOM: [
    {
      tag: 'div.csl-bib-body',
      getAttrs: p => {
        const dom = p as HTMLDivElement

        return {
          contents: dom.outerHTML,
        }
      },
    },
  ],
  toDOM: node => {
    const bibliographyElementNode = node as BibliographyElementNode

    return (
      nodeFromHTML(bibliographyElementNode.attrs.contents) ||
      createBodyElement(bibliographyElementNode)
    )
  },
}
