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

import { ManuscriptNode } from '../types'
import { CommentNode } from './comment'

interface Attrs {
  id: string
  content: string
  format: string
  comments?: CommentNode[]
}

export interface InlineEquationNode extends ManuscriptNode {
  attrs: Attrs
}

export const inlineEquation: NodeSpec = {
  attrs: {
    id: { default: '' },
    dataTracked: { default: null },
    comments: { default: null },
    content: { default: '' },
    format: { default: '' },
  },
  selectable: false,
  atom: true,
  inline: true,
  draggable: true,
  group: 'inline',
  parseDOM: [
    {
      tag: `span.MPInlineMathFragment`,
      getAttrs: (p) => {
        const dom = p as HTMLElement
        return {
          id: dom.getAttribute('id'),
          format: dom.getAttribute('data-equation-format'),
          content: dom.innerHTML,
        }
      },
    },
  ],
  toDOM: (node) => {
    const inlineEquationNode = node as InlineEquationNode
    const { id, content, format } = inlineEquationNode.attrs

    const attrs: { [key: string]: string } = {}
    const dom = document.createElement('span')
    dom.classList.add('MPInlineMathFragment')
    attrs.id = id
    if (format) {
      attrs['data-equation-format'] = format
    }
    dom.innerHTML = content
    return dom
  },
}
