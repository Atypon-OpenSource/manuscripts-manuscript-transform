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

interface Attrs {
  columns: number
  figureLayout: string
  figureStyle: string
  id: string
  label: string
  rows: number
  suppressCaption: boolean
  expandListing: boolean
}

export interface FigureElementNode extends ManuscriptNode {
  attrs: Attrs
}

export const figureElement: NodeSpec = {
  content: '(figure | placeholder)+ figcaption listing',
  attrs: {
    figureLayout: { default: '' },
    figureStyle: { default: '' },
    id: { default: '' },
    label: { default: '' },
    suppressCaption: { default: false },
  },
  selectable: false,
  group: 'block element',
  parseDOM: [
    {
      tag: 'figure.figure-group',
      getAttrs: p => {
        const dom = p as HTMLElement

        return {
          id: dom.getAttribute('id'),
          figureStyle: dom.getAttribute('data-figure-style'),
          figureLayout: dom.getAttribute('data-figure-layout'),
        }
      },
    },
  ],
  toDOM: node => {
    const figureElementNode = node as FigureElementNode

    return [
      'figure',
      {
        class: 'figure-group',
        id: figureElementNode.attrs.id,
        'data-figure-style': figureElementNode.attrs.figureStyle,
        'data-figure-layout': figureElementNode.attrs.figureLayout,
      },
      0,
    ]
  },
}

export const isFigureElementNode = (
  node: ManuscriptNode
): node is FigureElementNode =>
  node.type === node.type.schema.nodes.figure_element
