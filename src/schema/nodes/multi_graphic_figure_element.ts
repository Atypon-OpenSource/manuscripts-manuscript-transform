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
  alignment?: string
  sizeFraction: number
  suppressCaption: boolean
  suppressTitle?: boolean
  expandListing: boolean
}

export interface MultiGraphicFigureElementNode extends ManuscriptNode {
  attrs: Attrs
}

export const multiGraphicFigureElement: NodeSpec = {
  content: '(figure | placeholder)+ figcaption (listing | placeholder)',
  attrs: {
    figureLayout: { default: '' },
    figureStyle: { default: '' },
    id: { default: '' },
    label: { default: '' },
    sizeFraction: { default: 0 },
    alignment: { default: undefined },
    suppressCaption: { default: false },
    suppressTitle: { default: undefined },
  },
  selectable: false,
  group: 'block element executable',
  parseDOM: [
    {
      tag: 'figure.figure-group',
      getAttrs: (p) => {
        const dom = p as HTMLElement

        return {
          id: dom.getAttribute('id'),
          figureStyle: dom.getAttribute('data-figure-style'),
          figureLayout: dom.getAttribute('data-figure-layout'),
          sizeFraction: Number(dom.getAttribute('data-size-fraction')) || 0,
          alignment: dom.getAttribute('data-alignment') || undefined,
        }
      },
    },
  ],
  toDOM: (node) => {
    const multiGraphicFigureElementNode = node as MultiGraphicFigureElementNode

    const {
      id,
      figureStyle,
      figureLayout,
      alignment,
      sizeFraction,
    } = multiGraphicFigureElementNode.attrs

    const attrs: { [key: string]: string } = {}

    const classes: string[] = ['figure-group']

    if (sizeFraction === 2) {
      classes.push('figure-group--static')
    }

    attrs.class = classes.join(' ')

    attrs.id = id

    if (figureStyle) {
      attrs['data-figure-style'] = figureStyle
    }

    if (figureLayout) {
      attrs['data-figure-layout'] = figureLayout
    }

    if (sizeFraction) {
      attrs['data-size-fraction'] = String(sizeFraction)
    }

    if (alignment) {
      attrs['data-alignment'] = alignment
    }

    return ['figure', attrs, 0]
  },
}

export const isMultiGraphicFigureElementNode = (
  node: ManuscriptNode
): node is MultiGraphicFigureElementNode =>
  node.type === node.type.schema.nodes.multi_graphic_figure_element