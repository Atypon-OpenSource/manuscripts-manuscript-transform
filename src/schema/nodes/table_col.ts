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

// adapted from 'prosemirror-tables'

import { getTrimmedAttribute } from '../../lib/utils'
import { ManuscriptNode, TableNodeSpec } from '../types'

export type TableColGroupNode = ManuscriptNode
export interface TableColNode extends ManuscriptNode {
  attrs: {
    width: string
  }
}

export const tableColGroup: TableNodeSpec = {
  content: 'table_col+',
  group: 'block',
  tableRole: 'colgroup',
  parseDOM: [
    {
      tag: 'colgroup',
    },
  ],
  toDOM() {
    return ['colgroup', 0]
  },
}

export const tableCol: TableNodeSpec = {
  attrs: {
    width: { default: '' },
  },
  group: 'block',
  tableRole: 'col',
  parseDOM: [
    {
      tag: 'col',
      getAttrs: (p) => {
        const dom = p as HTMLTableColElement

        return {
          width: getTrimmedAttribute(dom, 'width'),
        }
      },
    },
  ],
  toDOM: (node) => {
    const tableColNode = node as TableColNode

    const attrs: { [key: string]: string } = {}

    if (tableColNode.attrs.width) {
      attrs['width'] = tableColNode.attrs.width
    }

    return ['col', attrs]
  },
}
