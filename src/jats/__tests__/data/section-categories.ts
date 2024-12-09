/*!
 * © 2024 Atypon Systems LLC
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

import { SectionCategory } from '../../../schema'

export const sectionCategories: SectionCategory[] = [
  {
    id: 'abstract',
    titles: ['Abstract'],
    synonyms: ['abstract'],
    group: 'abstracts',
    isUnique: false,
  },
  {
    id: 'acknowledgements',
    synonyms: ['acknowledgements', 'acknowledgments'],
    titles: ['Acknowledgements'],
    group: 'backmatter',
    isUnique: true,
  },
  {
    id: 'appendices',
    titles: ['Appendices'],
    synonyms: ['appendices'],
    isUnique: false,
  },
  {
    id: 'availability',
    titles: ['Availability'],
    synonyms: ['availability', 'data-availability', 'data availability'],
    group: 'backmatter',
    isUnique: true,
  },
  {
    id: 'coi-statement',
    synonyms: [
      'coi-statement',
      'competing-interests',
      'conflict',
      'conflict of interest',
      'competing interests',
    ],
    titles: ['COI Statement', 'Competing Interests'],
    group: 'backmatter',
    isUnique: true,
  },
  {
    id: 'con',
    synonyms: ['con'],
    titles: ['Contributed-by information'],
    group: 'backmatter',
    isUnique: true,
  },
  {
    id: 'conclusions',
    synonyms: ['conclusions'],
    titles: ['Conclusions'],
    group: 'body',
    isUnique: false,
  },
  {
    id: 'deceased',
    titles: ['Deceased'],
    synonyms: ['deceased'],
    isUnique: false,
  },
  {
    id: 'discussion',
    synonyms: ['discussion'],
    titles: ['Discussion'],
    group: 'body',
    isUnique: false,
  },
  {
    id: 'equal',
    titles: ['Equal'],
    synonyms: ['equal'],
    isUnique: false,
  },
  {
    id: 'ethics-statement',
    synonyms: ['ethics-statement'],
    titles: ['Ethics Statement'],
    group: 'backmatter',
    isUnique: true,
  },
  {
    id: 'financial-disclosure',
    synonyms: ['financial-disclosure', 'funding information'],
    titles: ['Financial Disclosure'],
    group: 'backmatter',
    isUnique: true,
  },
  {
    id: 'abstract-teaser',
    titles: ['Abstract Teaser'],
    synonyms: ['abstract-teaser'],
    isUnique: false,
  },
  {
    id: 'intro',
    synonyms: ['intro', 'introduction'],
    titles: ['Introduction'],
    group: 'body',
    isUnique: false,
  },
  {
    id: 'methods',
    synonyms: [
      'materials',
      'methods',
      'materials and methods',
      'materials & methods',
    ],
    titles: ['Materials & Methods'],
    group: 'body',
    isUnique: false,
  },
  {
    id: 'present-address',
    titles: ['Present Address'],
    synonyms: ['present-address'],
    isUnique: false,
  },
  {
    id: 'presented-at',
    titles: ['Presented at'],
    synonyms: ['presented-at'],
    isUnique: false,
  },
  {
    id: 'previously-at',
    titles: ['Previously at'],
    synonyms: ['previously-at'],
    isUnique: false,
  },
  {
    id: 'results',
    synonyms: ['results'],
    titles: ['Results'],
    group: 'body',
    isUnique: false,
  },
  {
    id: 'review',
    titles: ['Review'],
    synonyms: [],
    group: 'body',
    isUnique: false,
  },
  {
    id: 'supplementary-material',
    synonyms: ['supplementary-material'],
    titles: ['Supplementary Material'],
    group: 'backmatter',
    isUnique: true,
  },
  {
    id: 'supported-by',
    synonyms: ['supported-by'],
    titles: ['Supported By'],
    group: 'backmatter',
    isUnique: true,
  },
]