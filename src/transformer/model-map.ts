/*!
 * © 2020 Atypon Systems LLC
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

import { Model, ObjectTypes } from '@manuscripts/manuscripts-json-schema'
import { generateID } from './id'

export type AddModel = <T extends Model>(data: Partial<T>) => void

export const addModelToMap = (modelMap: Map<string, Model>): AddModel => <
  T extends Model
>(
  data: Partial<T>
) => {
  data._id = generateID(data.objectType as ObjectTypes)

  modelMap.set(data._id, data as T)
}
