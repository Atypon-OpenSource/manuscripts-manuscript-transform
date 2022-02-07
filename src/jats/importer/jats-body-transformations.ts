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

const removeNodeFromParent = (node: Element) =>
  node.parentNode && node.parentNode.removeChild(node)

const capitalizeFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1)

export const jatsBodyTransformations = {
  ensureSection(
    body: Element,
    createElement: (tagName: string) => HTMLElement
  ) {
    // Create and add a section if there is no section the content can be appended into
    let section = createElement('sec') as Element

    const title = section.querySelector('title')
    if (!title) {
      const title = createElement('title')
      title.textContent = ''
      section.appendChild(title)
    }

    const { firstElementChild } = body
    if (firstElementChild && firstElementChild.tagName === 'sec') {
      section = firstElementChild
    } else {
      body.insertBefore(section, body.firstChild)
    }

    // Move any element without a section to the previous section
    body.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as Element
        if (element.tagName !== 'sec') {
          section.appendChild(element)
        } else {
          section = element
        }
      }
    })
  },
  createAbstract(
    abstractNode: Element,
    createElement: (tagName: string) => HTMLElement
  ) {
    const abstractType = abstractNode.getAttribute('abstract-type')

    const section = createElement('sec')
    const sectionType = abstractType ? `abstract-${abstractType}` : 'abstract'
    section.setAttribute('sec-type', sectionType)

    const title = createElement('title')
    title.textContent = abstractType
      ? `${capitalizeFirstLetter(abstractType)} Abstract`
      : 'Abstract'
    section.appendChild(title)

    while (abstractNode.firstChild) {
      section.appendChild(abstractNode.firstChild)
    }
    return section
  },
  createAcknowledgments(
    ackNode: Element,
    createElement: (tagName: string) => HTMLElement
  ) {
    const section = createElement('sec')
    section.setAttribute('sec-type', 'acknowledgments')

    const titleNode = ackNode.querySelector('title')

    if (titleNode) {
      section.appendChild(titleNode)
    } else {
      const title = createElement('title')
      title.textContent = 'Acknowledgements'
      section.appendChild(title)
    }

    while (ackNode.firstChild) {
      section.appendChild(ackNode.firstChild)
    }
    return section
  },
  createBibliography(
    titleNode: Element | null,
    bibliography: Element | null,
    createElement: (tagName: string) => HTMLElement
  ) {
    const section = createElement('sec')
    section.setAttribute('sec-type', 'bibliography')

    if (titleNode) {
      section.appendChild(titleNode)
    } else {
      const title = createElement('title')
      title.textContent = 'Bibliography'
      section.appendChild(title)
    }

    if (bibliography) {
      const bib = createElement('bibliography')
      bib.appendChild(bibliography)
      section.appendChild(bib)
    }

    return section
  },
  createFootnotes(
    footnoteGroups: Element[],
    createElement: (tagName: string) => HTMLElement
  ) {
    const section = createElement('sec')
    section.setAttribute('sec-type', 'notes')

    const titleNode = footnoteGroups
      .map((g) => g.querySelector('title'))
      .filter((t) => t !== null)[0]

    if (titleNode) {
      section.appendChild(titleNode)
    } else {
      const title = createElement('title')
      title.textContent = 'Footnotes'
      section.appendChild(title)
    }

    for (const footnoteGroup of footnoteGroups) {
      section.appendChild(footnoteGroup)
    }

    return section
  },
  createAppendixSection(
    app: Element,
    createElement: (tagName: string) => HTMLElement
  ) {
    const section = createElement('sec')
    section.setAttribute('sec-type', 'appendices')
    section.append(...app.children)
    return section
  },
  createFloatsGroupSection(
    floatsGroup: Element,
    createElement: (tagName: string) => HTMLElement
  ) {
    const section = createElement('sec')
    section.setAttribute('sec-type', 'floating-element')

    const title = createElement('title')
    title.textContent = 'Floating Group'
    section.appendChild(title)

    section.append(...floatsGroup.children)
    return section
  },
  moveSectionsToBody(
    doc: Document,
    body: Element,
    bibliographyEl: Element | null,
    createElement: (tagName: string) => HTMLElement
  ) {
    const abstractNodes = doc.querySelectorAll(
      'front > article-meta > abstract'
    )
    for (const abstractNode of abstractNodes) {
      const abstract = this.createAbstract(abstractNode, createElement)
      removeNodeFromParent(abstractNode)
      body.insertBefore(abstract, body.firstChild)
    }

    // move sections from back to body
    for (const section of doc.querySelectorAll('back > sec')) {
      removeNodeFromParent(section)
      body.appendChild(section)
    }

    // move acknowledg(e)ments from back to body section
    const ackNode = doc.querySelector('back > ack')
    if (ackNode) {
      const acknowledgements = this.createAcknowledgments(
        ackNode,
        createElement
      )
      removeNodeFromParent(ackNode)
      body.appendChild(acknowledgements)
    }

    //move appendices from back to body
    const appGroup = doc.querySelectorAll('back > app-group > app')

    for (const app of appGroup) {
      const appendix = this.createAppendixSection(app, createElement)
      removeNodeFromParent(app)
      body.appendChild(appendix)
    }
    // move bibliography from back to body section
    const refList = doc.querySelector('back > ref-list')
    if (refList) {
      const bibliography = this.createBibliography(
        refList.querySelector('title'),
        bibliographyEl,
        createElement
      )
      removeNodeFromParent(refList)
      body.appendChild(bibliography)
    }

    // move footnotes without fn-type from back to body section
    let footnoteGroups = [
      ...doc.querySelectorAll('back > fn-group:not([fn-type])'),
    ]
    // check if these groups don't have an fn-type because they are actually a mixed group and not a normal footnote group
    footnoteGroups = footnoteGroups.filter((group) => {
      // count check for if all the irrelevant fns as already been extracted
      return group.childElementCount === 0
        ? false
        : !group.querySelector('fn[fn-type]')
    })

    if (footnoteGroups.length > 0) {
      footnoteGroups.map((g) => removeNodeFromParent(g))
      const footnotes = this.createFootnotes(footnoteGroups, createElement)
      body.appendChild(footnotes)
    }
  },
  mapFootnotesToSections(
    doc: Document,
    body: Element,
    createElement: (tagName: string) => HTMLElement
  ) {
    const footnoteGroups = [...doc.querySelectorAll('fn-group')]
    if (footnoteGroups.length > 0) {
      const section = createElement('sec')
      section.setAttribute('sec-type', 'notes')

      const sectionTitleElement = createElement('title')
      sectionTitleElement.textContent = 'Footnotes'
      section.append(sectionTitleElement)

      for (const footnoteGroup of footnoteGroups) {
        removeNodeFromParent(footnoteGroup)
        section.append(footnoteGroup)
      }
      body.append(section)
    }

    const footnotes = [...doc.querySelectorAll('fn')]
    const footnotesSection = doc.querySelector('sec[sec-type="notes"]')
    const footnotesSectionGroup = footnotesSection?.querySelector('fn-group')
    const containingGroup = footnotesSectionGroup || createElement('fn-group')

    for (const footnote of footnotes) {
      const type = footnote.getAttribute('fn-type')
      if (!type) {
        containingGroup.appendChild(footnote)
      }
    }

    if (!footnotesSection) {
      const section = this.createFootnotes([containingGroup], createElement)
      body.append(section)
    }
  },
  // wrap single figures in fig-group
  wrapFigures(body: Element, createElement: (tagName: string) => HTMLElement) {
    const figures = body.querySelectorAll('sec > fig')

    for (const figure of figures) {
      const figType = figure.getAttribute('fig-type')

      // only wrap actual figures
      if (figType && figType !== 'figure') {
        continue
      }

      const section = figure.parentNode as Element

      const figGroup = createElement('fig-group')
      section.insertBefore(figGroup, figure)

      // move id from figure to fig-group
      const figureID = figure.getAttribute('id')
      if (figureID) {
        figGroup.setAttribute('id', figureID)
      }
      figure.removeAttribute('id')

      // move caption into fig-group
      const figCaption = figure.querySelector('caption')
      const graphics = figure.querySelectorAll('graphic')

      if (graphics.length > 1) {
        // TODO: copy attributes?

        // split multiple graphics into separate sub-figures
        for (const [i, graphic] of graphics.entries()) {
          if (i !== graphics.length - 1) {
            const newFig = createElement('fig')
            newFig.appendChild(graphic)
            figGroup.appendChild(newFig.cloneNode(true))
            graphic.remove()
          } else {
            const clonedFig = figure.cloneNode(true)
            figGroup.setAttribute('multiGraphic', 'true')
            figGroup.appendChild(clonedFig)
          }
        }
        section.removeChild(figure)
      } else {
        // move single- or no-graphic figure into fig-group
        figGroup.appendChild(figure)
      }

      // caption goes to the end
      if (figCaption) {
        figGroup.appendChild(figCaption)
      }
    }
  },
  // move captions to the end of their containers
  moveCaptionsToEnd(body: Element) {
    const captions = body.querySelectorAll('caption')

    for (const caption of captions) {
      if (caption.parentNode) {
        caption.parentNode.appendChild(caption)
      }
    }
  },
  moveTableFooterToEnd(body: Element) {
    const tableFooters = body.querySelectorAll('table-wrap-foot')

    for (const tableFooter of tableFooters) {
      if (tableFooter.parentNode) {
        tableFooter.parentNode.appendChild(tableFooter)
      }
    }
  },
  // unwrap paragraphs in captions
  unwrapParagraphsInCaptions(body: Element) {
    const captions = body.querySelectorAll('caption')

    for (const caption of captions) {
      const paragraphNodes = caption.querySelectorAll('p')

      paragraphNodes.forEach((paragraphNode) => {
        if (paragraphNode.parentNode) {
          while (paragraphNode.firstChild) {
            paragraphNode.parentNode.insertBefore(
              paragraphNode.firstChild,
              paragraphNode
            )
          }

          paragraphNode.parentNode.removeChild(paragraphNode)
        }
      })
    }
  },
  moveFloatsGroupToBody(
    doc: Document,
    body: Element,
    createElement: (tagName: string) => HTMLElement
  ) {
    const floatsGroup = doc.querySelector('floats-group')
    if (floatsGroup) {
      const floatsGroupSection = this.createFloatsGroupSection(
        floatsGroup,
        createElement
      )
      removeNodeFromParent(floatsGroup)
      body.appendChild(floatsGroupSection)
    }
  },
  moveBlockNodesFromParagraph(
    doc: Document,
    body: Element,
    createElement: (tagName: string) => HTMLElement
  ) {
    // TODO:: add other block node to the array
    const blockNodes = ['disp-formula']
    const paragraphs = [...body.querySelectorAll('sec > p')].filter((node) =>
      blockNodes.find((node_name) =>
        node.querySelector(`:scope > ${node_name}`)
      )
    )

    paragraphs.map((paragraph) => {
      let newParagraph = createElement('p')
      const parent = doc.createDocumentFragment()

      while (paragraph?.firstChild) {
        if (blockNodes.includes(paragraph?.firstChild.nodeName)) {
          if (newParagraph.innerHTML.trim().length > 0) {
            parent.append(newParagraph)
            newParagraph = createElement('p')
          }
          parent.append(paragraph?.firstChild)
        } else {
          newParagraph.append(paragraph?.firstChild)
        }
      }

      paragraph?.replaceWith(parent)
    })
  },
}
