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

import { Decoder } from '../decode'
import { encode } from '../encode'
import { ManuscriptModel } from '../models'
import { createTestDoc } from './__helpers__/doc'
import {
  createTestModelMapWithHighlights,
  createTestModelMapWithKeywords,
} from './__helpers__/highlights'

describe('encoder', () => {
  test('encode a test doc', async () => {
    const doc = createTestDoc()

    const result = encode(doc)

    expect(result).toMatchSnapshot()
  })

  test('encode highlight markers', async () => {
    const modelMap = createTestModelMapWithHighlights()

    const decoder = new Decoder(modelMap)

    const doc = decoder.createArticleNode()

    const result = encode(doc)

    expect(result).toMatchSnapshot()

    const ensureModel = (model: Partial<ManuscriptModel>): ManuscriptModel => {
      model.containerID = 'MPProject:1'
      model.manuscriptID = 'MPManuscript:1'
      model.sessionID = 'test'
      model.createdAt = 0
      model.updatedAt = 0

      for (const key of Object.keys(model)) {
        const value = model[key as keyof ManuscriptModel]
        if (value === undefined || value === '') {
          delete model[key as keyof ManuscriptModel]
        }
      }

      return model as ManuscriptModel
    }

    for (const item of result.values()) {
      const model = ensureModel(item)
      expect(model).toEqual(modelMap.get(model._id))
    }
  })

  test('encode keywords element', async () => {
    const modelMap = createTestModelMapWithKeywords()

    const decoder = new Decoder(modelMap)

    const doc = decoder.createArticleNode()

    const result = encode(doc)

    expect(result).toMatchSnapshot()

    const ensureModel = (model: Partial<ManuscriptModel>): ManuscriptModel => {
      model.containerID = 'MPProject:1'
      model.manuscriptID = 'MPManuscript:1'
      model.sessionID = 'test'
      model.createdAt = 0
      model.updatedAt = 0

      for (const key of Object.keys(model)) {
        const value = model[key as keyof ManuscriptModel]
        if (value === undefined || value === '') {
          delete model[key as keyof ManuscriptModel]
        }
      }

      return model as ManuscriptModel
    }

    for (const item of result.values()) {
      const model = ensureModel(item)
      expect(model).toEqual(modelMap.get(model._id))
    }
  })
})
