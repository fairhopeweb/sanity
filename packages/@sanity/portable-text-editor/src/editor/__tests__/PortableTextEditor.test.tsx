/**
 * @jest-environment ./test/setup/jsdom.jest.env.ts
 */
/* eslint-disable no-irregular-whitespace */
// eslint-disable-next-line import/no-unassigned-import
import '@testing-library/jest-dom/extend-expect'
import {act} from 'react-dom/test-utils'
import {render} from '@testing-library/react'
import React, {ForwardedRef, forwardRef, useCallback, useEffect} from 'react'

import Schema from '@sanity/schema'
import {PortableTextEditor, PortableTextEditorProps} from '../PortableTextEditor'
import {RawType} from '../../types/schema'
import {PortableTextEditable} from '../Editable'
import {PortableTextBlock} from '../../types/portableText'
import {EditorSelection} from '../..'

const imageType: RawType = {
  type: 'image',
  name: 'blockImage',
}

const someObject: RawType = {
  type: 'object',
  name: 'someObject',
  fields: [{type: 'string', name: 'color'}],
}

const blockType: RawType = {
  type: 'block',
  name: 'myTestBlockType',
  styles: [
    {title: 'Normal', value: 'normal'},
    {title: 'H1', value: 'h1'},
    {title: 'H2', value: 'h2'},
    {title: 'H3', value: 'h3'},
    {title: 'H4', value: 'h4'},
    {title: 'H5', value: 'h5'},
    {title: 'H6', value: 'h6'},
    {title: 'Quote', value: 'blockquote'},
  ],
  of: [someObject, imageType],
}

const portableTextType: RawType = {
  type: 'array',
  name: 'body',
  of: [blockType, someObject],
}

const schema = Schema.compile({
  name: 'test',
  types: [portableTextType],
})

const helloBlock: PortableTextBlock = {
  _key: '123',
  _type: 'myTestBlockType',
  markDefs: [],
  children: [{_key: '567', _type: 'span', text: 'Hello', marks: []}],
}

let key = 0

export const PortableTextEditorTester = forwardRef(function PortableTextEditorTester(
  props: Partial<
    Omit<PortableTextEditorProps, 'type' | 'onChange | value' | 'selection' | 'placeholderText'>
  > & {
    type: PortableTextEditorProps['type']
    value?: PortableTextEditorProps['value']
    onChange?: PortableTextEditorProps['onChange']
    selection?: PortableTextEditorProps['selection']
    placeholderText?: string
  },
  ref: ForwardedRef<PortableTextEditor>
) {
  useEffect(() => {
    key = 0
  })
  const _keyGenerator = useCallback(() => {
    key++
    return `${key}`
  }, [])
  return (
    <PortableTextEditor
      type={props.type}
      onChange={props.onChange || jest.fn()}
      value={props.value || undefined}
      keyGenerator={_keyGenerator}
      ref={ref}
    >
      <PortableTextEditable
        selection={props.selection || undefined}
        placeholderText={props.placeholderText || 'Type here'}
      />
    </PortableTextEditor>
  )
})

export const type = schema.get('body')

describe('initialization', () => {
  it('receives initial onChange events and has custom placeholder text', () => {
    const editorRef: React.RefObject<PortableTextEditor> = React.createRef()
    const onChange = jest.fn()
    const {container} = render(
      <PortableTextEditorTester
        onChange={onChange}
        placeholderText="Jot something down here"
        ref={editorRef}
        type={type}
        value={undefined}
      />
    )

    expect(editorRef.current).not.toBe(null)
    expect(onChange).toHaveBeenCalledWith({type: 'ready'})
    expect(onChange).toHaveBeenCalledWith({type: 'value', value: undefined})
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div>
          <div
            autocapitalize="false"
            autocorrect="false"
            class="pt-editable"
            contenteditable="true"
            data-slate-editor="true"
            data-slate-node="value"
            role="textbox"
            spellcheck="false"
            style="position: relative; outline: none; white-space: pre-wrap; word-wrap: break-word; min-height: 0px;"
            zindex="-1"
          >
            <div
              class="pt-block pt-text-block pt-text-block-style-normal"
              data-slate-node="element"
            >
              <div
                draggable="false"
              >
                <div>
                  <span
                    data-slate-node="text"
                  >
                    <span
                      data-slate-leaf="true"
                    >
                      <span>
                        <span
                          contenteditable="false"
                          data-slate-placeholder="true"
                          style="position: absolute; pointer-events: none; width: 100%; max-width: 100%; display: block; opacity: 0.333; user-select: none; text-decoration: none;"
                        >
                          Jot something down here
                        </span>
                        <span
                          data-slate-length="0"
                          data-slate-zero-width="n"
                        >
                          ﻿
                          <br />
                        </span>
                      </span>
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `)
  })
  it('takes value from props', () => {
    const initialValue = [helloBlock]
    const onChange = jest.fn()
    render(<PortableTextEditorTester onChange={onChange} type={type} value={initialValue} />)
    expect(onChange).toHaveBeenCalledWith({type: 'value', value: initialValue})
  })
  it('takes initial selection from props', () => {
    const editorRef: React.RefObject<PortableTextEditor> = React.createRef()
    const initialValue = [helloBlock]
    const initialSelection: EditorSelection = {
      anchor: {path: [{_key: '123'}, 'children', {_key: '567'}], offset: 2},
      focus: {path: [{_key: '123'}, 'children', {_key: '567'}], offset: 2},
    }
    const onChange = jest.fn()
    render(
      <PortableTextEditorTester
        onChange={onChange}
        ref={editorRef}
        selection={initialSelection}
        type={type}
        value={initialValue}
      />
    )
    if (!editorRef.current) {
      throw new Error('No editor')
    }
    PortableTextEditor.focus(editorRef.current)
    expect(PortableTextEditor.getSelection(editorRef.current)).toEqual(initialSelection)
  })

  it('updates editor selection from new prop', () => {
    const editorRef: React.RefObject<PortableTextEditor> = React.createRef()
    const initialValue = [helloBlock]
    const initialSelection: EditorSelection = {
      anchor: {path: [{_key: '123'}, 'children', {_key: '567'}], offset: 0},
      focus: {path: [{_key: '123'}, 'children', {_key: '567'}], offset: 0},
    }
    const newSelection: EditorSelection = {
      anchor: {path: [{_key: '123'}, 'children', {_key: '567'}], offset: 0},
      focus: {path: [{_key: '123'}, 'children', {_key: '567'}], offset: 3},
    }
    const onChange = jest.fn()
    const {rerender} = render(
      <PortableTextEditorTester
        onChange={onChange}
        ref={editorRef}
        selection={initialSelection}
        type={type}
        value={initialValue}
      />
    )
    if (!editorRef.current) {
      throw new Error('No editor')
    }
    act(() => {
      if (editorRef.current) {
        PortableTextEditor.focus(editorRef.current)
        expect(PortableTextEditor.getSelection(editorRef.current)).toEqual(initialSelection)
      }
    })
    rerender(
      <PortableTextEditorTester
        onChange={onChange}
        ref={editorRef}
        selection={newSelection}
        type={type}
        value={initialValue}
      />
    )
    act(() => {
      if (editorRef.current) {
        expect(PortableTextEditor.getSelection(editorRef.current)).toEqual(newSelection)
      }
    })
  })
})