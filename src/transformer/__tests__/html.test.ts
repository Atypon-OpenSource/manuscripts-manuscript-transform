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

import projectDump from '@manuscripts/examples/data/project-dump.json'
import { JSDOM } from 'jsdom'
import { serializeToHTML } from '../html'
import { parseProjectBundle, ProjectBundle } from '../project-bundle'

describe('html', () => {
  test('export', () => {
    const { doc, manuscript, modelMap } = parseProjectBundle(
      projectDump as ProjectBundle,
      JSDOM.fragment
    )

    const result = serializeToHTML(doc.content, manuscript, modelMap)

    expect(result).toMatchSnapshot('html-export')
  })
})
