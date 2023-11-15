/*!
 * © 2023 Atypon Systems LLC
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
declare module 'citeproc' {
  interface Citation {
    citationItems: Array<{ id: string; prefix?: string; suffix?: string }>
    properties?: {
      mode?: string
      noteIndex?: number
      infix?: string
    }
  }

  interface SystemOptions {
    retrieveLocale: (id: string) => string | Document | Locale
    retrieveItem: (id: string) => CSL.Data
  }

  type Bibliography = string[]

  export class Engine {
    constructor(
      sys: SystemOptions,
      style: string | Style,
      lang?: string,
      forceLang?: boolean
    )
    public previewCitationCluster(
      citation,
      citationsPre,
      citationPost,
      format
    ): string
  }

  export function getLocaleNames(
    style: string | Record<string, unknown>,
    preferredLocale: string
  ): string[]

  type Locale = Record<string, unknown>

  type Node = {
    name: string
    attrs: Record<string, unknown>
    children: Node[]
  }
}
