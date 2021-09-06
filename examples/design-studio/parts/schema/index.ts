import schemaTypes from 'all:part:@sanity/base/schema-type'
import createSchema from 'part:@sanity/base/schema-creator'

// types
import {pseudoReferenceType} from './types/pseudoReference'

// document types
// NOTE: keep this alphabetized
import allInputs from './allInputs'
import arrayInArray from './arrayInArray'
import author from './author'
import complexArrays from './complexArrays'
import live from './live'
import pt from './pt'
import radioInputs from './radioInputs'
import selectInputs from './selectInputs'
import settings from './settings'

export default createSchema({
  name: 'design-studio',

  // NOTE: keep this alphabetized
  types: schemaTypes.concat([
    // types:
    pseudoReferenceType,
    // documents types:
    allInputs,
    arrayInArray,
    author,
    complexArrays,
    live,
    pt,
    radioInputs,
    selectInputs,
    settings,
  ]),
})
