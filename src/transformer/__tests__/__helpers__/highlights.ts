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

import {
  CommentAnnotation,
  Figure,
  FigureElement,
  Highlight,
  Keyword,
  KeywordGroup,
  KeywordsElement,
  Manuscript,
  Model,
  ObjectTypes,
  ParagraphElement,
  Project,
  Section,
  Titles,
} from '@manuscripts/json-schema'

export const createTestModelMapWithHighlights = () => {
  const modelMap = new Map<string, Model>()

  const project: Project = {
    objectType: ObjectTypes.Project,
    _id: 'MPProject:1',
    createdAt: 0,
    updatedAt: 0,
    owners: [],
    writers: [],
    viewers: [],
  }

  const manuscript: Manuscript = {
    objectType: ObjectTypes.Manuscript,
    _id: 'MPManuscript:1',
    createdAt: 0,
    updatedAt: 0,
    containerID: project._id,
  }

  modelMap.set(manuscript._id, manuscript)

  const paragraphHighlight: Highlight = {
    objectType: ObjectTypes.Highlight,
    _id: 'MPHighlight:1',
    createdAt: 0,
    updatedAt: 0,
    manuscriptID: manuscript._id,
    containerID: project._id,
  }

  modelMap.set(paragraphHighlight._id, paragraphHighlight)

  const titles: Titles = {
    objectType: ObjectTypes.Titles,
    _id: 'MPTitles:1',
    title: 'main title',
    subtitle: 'subtitle',
    runningTitle: 'runningTitle',
    createdAt: 0,
    updatedAt: 0,
    manuscriptID: manuscript._id,
    containerID: project._id,
  }
  modelMap.set(titles._id, titles)

  const paragraphWithHighlight: ParagraphElement = {
    objectType: ObjectTypes.ParagraphElement,
    _id: 'MPParagraphElement:1',
    createdAt: 0,
    updatedAt: 0,
    manuscriptID: manuscript._id,
    containerID: project._id,
    elementType: 'p',
    paragraphStyle: 'MPParagraphStyle:1',
    contents:
      '<p xmlns="http://www.w3.org/1999/xhtml" id="MPParagraphElement:1" class="MPElement MPParagraphStyle_1" data-object-type="MPParagraphElement">This sentence contains a highlight.</p>',
  }

  modelMap.set(paragraphWithHighlight._id, paragraphWithHighlight)

  const paragraphComment: CommentAnnotation = {
    objectType: ObjectTypes.CommentAnnotation,
    _id: 'MPCommentAnnotation:test',
    target: 'MPParagraphElement:1',
    selector: { from: 166, to: 175 },
    contents: 'Test Comment',
    createdAt: 0,
    updatedAt: 0,
    manuscriptID: manuscript._id,
    containerID: project._id,
    contributions: [],
    resolved: false,
  }

  modelMap.set(paragraphComment._id, paragraphComment)

  const figureHighlight: Highlight = {
    objectType: ObjectTypes.Highlight,
    _id: 'MPHighlight:4',
    createdAt: 0,
    updatedAt: 0,
    manuscriptID: manuscript._id,
    containerID: project._id,
  }

  modelMap.set(figureHighlight._id, figureHighlight)

  const figureWithHighlight: Figure = {
    objectType: ObjectTypes.Figure,
    _id: 'MPFigure:1',
    createdAt: 0,
    updatedAt: 0,
    manuscriptID: manuscript._id,
    containerID: project._id,
  }

  modelMap.set(figureWithHighlight._id, figureWithHighlight)

  const figureElementHighlight: Highlight = {
    objectType: ObjectTypes.Highlight,
    _id: 'MPHighlight:3',
    createdAt: 0,
    updatedAt: 0,
    manuscriptID: manuscript._id,
    containerID: project._id,
  }

  modelMap.set(figureElementHighlight._id, figureElementHighlight)

  const figureElementWithHighlight: FigureElement = {
    objectType: ObjectTypes.FigureElement,
    _id: 'MPFigureElement:1',
    createdAt: 0,
    updatedAt: 0,
    manuscriptID: manuscript._id,
    containerID: project._id,

    elementType: 'figure',
    caption:
      '<p class="caption-description" data-placeholder-text="Caption..." contenteditable="true">A figure with a caption</p>',
    figureStyle: 'MPFigureStyle:1',
    containedObjectIDs: [figureWithHighlight._id],
  }

  modelMap.set(figureElementWithHighlight._id, figureElementWithHighlight)

  const figureComment: CommentAnnotation = {
    objectType: ObjectTypes.CommentAnnotation,
    _id: 'MPCommentAnnotation:test1',
    target: 'MPFigureElement:1',
    contents: '',
    createdAt: 0,
    updatedAt: 0,
    manuscriptID: manuscript._id,
    containerID: project._id,
    contributions: [],
    resolved: false,
  }

  modelMap.set(figureComment._id, figureComment)

  const sectionHighlight: Highlight = {
    objectType: ObjectTypes.Highlight,
    _id: 'MPHighlight:2',
    createdAt: 0,
    updatedAt: 0,
    manuscriptID: manuscript._id,
    containerID: project._id,
  }

  modelMap.set(sectionHighlight._id, sectionHighlight)

  const sectionWithHighlights: Section = {
    objectType: ObjectTypes.Section,
    _id: 'MPSection:1',
    createdAt: 0,
    updatedAt: 0,
    manuscriptID: manuscript._id,
    containerID: project._id,

    priority: 1,
    path: ['MPSection:1'],
    elementIDs: [paragraphWithHighlight._id, figureElementWithHighlight._id],
    generatedLabel: true,
    title: 'A section title with a highlight',
  }

  modelMap.set(sectionWithHighlights._id, sectionWithHighlights)

  const secComment: CommentAnnotation = {
    objectType: ObjectTypes.CommentAnnotation,
    _id: 'MPCommentAnnotation:test2',
    target: 'MPSection:1',
    selector: { from: 23, to: 32 },
    contents: '',
    createdAt: 0,
    updatedAt: 0,
    manuscriptID: manuscript._id,
    containerID: project._id,
    contributions: [],
    resolved: false,
  }

  modelMap.set(secComment._id, secComment)
  return modelMap
}

export const createTestModelMapWithKeywords = () => {
  const modelMap = new Map<string, Model>()

  const project: Project = {
    objectType: ObjectTypes.Project,
    _id: 'MPProject:1',
    createdAt: 0,
    updatedAt: 0,

    owners: [],
    writers: [],
    viewers: [],
  }

  const manuscript: Manuscript = {
    objectType: ObjectTypes.Manuscript,
    _id: 'MPManuscript:1',
    createdAt: 0,
    updatedAt: 0,
    containerID: project._id,
  }

  const titles: Titles = {
    objectType: ObjectTypes.Titles,
    _id: 'MPTitles:1',
    title: 'main title',
    subtitle: 'subtitle',
    runningTitle: 'runningTitle',
    createdAt: 0,
    updatedAt: 0,
    manuscriptID: manuscript._id,
    containerID: project._id,
  }
  modelMap.set(titles._id, titles)

  const keyword: Keyword = {
    objectType: ObjectTypes.Keyword,
    _id: 'MPKeyword:1',
    containedGroup: 'MPKeywordGroup:test',
    createdAt: 0,
    updatedAt: 0,
    containerID: project._id,

    name: 'test',
  }

  modelMap.set(keyword._id, keyword)

  modelMap.set(manuscript._id, manuscript)

  const keywordsElement: KeywordsElement = {
    objectType: ObjectTypes.KeywordsElement,
    _id: 'MPKeywordsElement:1',
    createdAt: 0,
    updatedAt: 0,
    containerID: project._id,
    manuscriptID: manuscript._id,

    paragraphStyle: 'MPParagraphStyle:1',
    elementType: 'div',
    contents: '<div></div>',
  }

  modelMap.set(keywordsElement._id, keywordsElement)

  const keywordGroup: KeywordGroup = {
    _id: 'MPKeywordGroup:test',
    createdAt: 0,
    updatedAt: 0,
    manuscriptID: manuscript._id,
    containerID: project._id,

    objectType: 'MPKeywordGroup',
    type: 'author',
    // title: 'KEYWORDS',
  }

  modelMap.set(keywordGroup._id, keywordGroup)
  return modelMap
}
export const createTestModelMapWithKeywordsAndAuthorQuery = () => {
  const modelMap = new Map<string, Model>()

  const project: Project = {
    objectType: ObjectTypes.Project,
    _id: 'MPProject:1',
    createdAt: 0,
    updatedAt: 0,

    owners: [],
    writers: [],
    viewers: [],
  }

  const manuscript: Manuscript = {
    objectType: ObjectTypes.Manuscript,
    _id: 'MPManuscript:1',
    createdAt: 0,
    updatedAt: 0,
    containerID: project._id,
  }

  const keyword: Keyword = {
    objectType: ObjectTypes.Keyword,
    _id: 'MPKeyword:1',
    createdAt: 0,
    updatedAt: 0,
    containerID: project._id,

    containedGroup: 'MPKeywordGroup:1',
    name: 'test',
  }

  modelMap.set(keyword._id, keyword)

  modelMap.set(manuscript._id, manuscript)

  const keywordsElement: KeywordsElement = {
    contents: '<div></div>',
    elementType: 'div',
    _id: 'MPKeywordsElement:1',
    createdAt: 0,
    updatedAt: 0,
    containerID: project._id,

    manuscriptID: 'MPManuscript:1',
    objectType: ObjectTypes.KeywordsElement,
  }

  modelMap.set(keywordsElement._id, keywordsElement)

  const sectionWithKeywordsElement: Section = {
    category: 'MPSectionCategory:keywords',
    priority: 1,
    title: 'Keywords',
    path: ['MPSection:test'],
    elementIDs: ['MPKeywordsElement:1'],
    _id: 'MPSection:test',
    createdAt: 0,
    updatedAt: 0,
    containerID: project._id,

    manuscriptID: 'MPManuscript:1',
    objectType: ObjectTypes.Section,
  }

  modelMap.set(sectionWithKeywordsElement._id, sectionWithKeywordsElement)

  const keywordGroup: KeywordGroup = {
    type: 'author',
    // title: 'KEYWORDS',
    _id: 'MPKeywordGroup:1',
    createdAt: 0,
    updatedAt: 0,
    containerID: project._id,

    manuscriptID: 'MPManuscript:1',
    objectType: ObjectTypes.KeywordGroup,
  }

  modelMap.set(keywordGroup._id, keywordGroup)

  const comment: CommentAnnotation = {
    _id: 'MPCommentAnnotation:3AAEE869-7DC9-4392-B8C6-9C5FCA522120',
    objectType: 'MPCommentAnnotation',
    target: 'MPKeywordGroup:1',
    createdAt: 0,
    updatedAt: 0,
    manuscriptID: manuscript._id,
    containerID: project._id,
    contents: 'KeywordQuery',

    selector: undefined,
    contributions: [],
    resolved: false,
  }

  modelMap.set(comment._id, comment)

  return modelMap
}

export const createTestModelMapWithDeprecatedKeywords = () => {
  const modelMap = new Map<string, Model>()

  const project: Project = {
    objectType: ObjectTypes.Project,
    _id: 'MPProject:1',
    createdAt: 0,
    updatedAt: 0,

    owners: [],
    writers: [],
    viewers: [],
  }

  const manuscript: Manuscript = {
    objectType: ObjectTypes.Manuscript,
    _id: 'MPManuscript:1',
    createdAt: 0,
    updatedAt: 0,
    containerID: project._id,
  }

  modelMap.set(manuscript._id, manuscript)

  const titles: Titles = {
    objectType: ObjectTypes.Titles,
    _id: 'MPTitles:1',
    title: 'main title',
    subtitle: 'subtitle',
    runningTitle: 'runningTitle',
    createdAt: 0,
    updatedAt: 0,
    manuscriptID: manuscript._id,
    containerID: project._id,
  }
  modelMap.set(titles._id, titles)

  const paragraphElement: ParagraphElement = {
    objectType: ObjectTypes.ParagraphElement,
    _id: 'MPParagraphElement:1',
    createdAt: 0,
    updatedAt: 0,
    containerID: project._id,
    manuscriptID: manuscript._id,

    paragraphStyle: 'MPParagraphStyle:1',
    elementType: 'p',
    contents: `<p id="MPParagraphElement:1" class="MPElement MPParagraphStyle_1">test</p>`,
  }

  modelMap.set(paragraphElement._id, paragraphElement)

  const keywordsSectionWithParagraphElement: Section = {
    objectType: ObjectTypes.Section,
    _id: 'MPSection:1',
    createdAt: 0,
    updatedAt: 0,
    manuscriptID: manuscript._id,
    containerID: project._id,

    priority: 1,
    path: ['MPSection:1'],
    elementIDs: [paragraphElement._id],
    generatedLabel: true,
    category: 'MPSectionCategory:keywords',
    title: 'Keywords',
  }

  modelMap.set(
    keywordsSectionWithParagraphElement._id,
    keywordsSectionWithParagraphElement
  )

  return modelMap
}
