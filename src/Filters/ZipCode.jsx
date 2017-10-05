import { addMultipleFilters } from '../actions/filter'
import { bindAll } from '../utils'
import CollapsibleFilter from './CollapsibleFilter'
import { connect } from 'react-redux'
import HighlightingOption from '../Typeahead/HighlightingOption'
import PropTypes from 'prop-types'
import React from 'react'
import StickyOptions from './StickyOptions'
import Typeahead from '../Typeahead'

const FIELD_NAME = 'zip_code'

export class ZipCode extends React.Component {
  constructor( props ) {
    super( props )

    // Bindings
    bindAll( this, [
      '_onInputChange',
      '_onOptionSelected',
      '_renderOption'
    ] )
  }

  render() {
    return (
      <CollapsibleFilter title="Zip code"
                         desc="The mailing ZIP code provided by the consumer"
                         className="aggregation">
        <Typeahead debounceWait={this.props.debounceWait}
                   onInputChange={this._onInputChange}
                   onOptionSelected={this._onOptionSelected}
                   placeholder="Enter first three digits of ZIP code"
                   renderOption={this._renderOption}
        />
        <StickyOptions fieldName={FIELD_NAME}
                       options={this.props.options}
                       selections={this.props.selections}
        />
      </CollapsibleFilter>
    )
  }


  // --------------------------------------------------------------------------
  // Typeahead interface

  _onInputChange( value ) {
    const n = value.toLowerCase()

    const qs = this.props.queryString + '&text=' + value

    const uri = '@@API_suggest_zip/' + qs
    return fetch( uri )
    .then( result => result.json() )
    .then( items => items.map( x => ( {
      key: x,
      label: x,
      position: x.indexOf( n ),
      value
    } ) ) )
  }

  _renderOption( obj ) {
    return {
      value: obj.key,
      component: <HighlightingOption {...obj} />
    }
  }

  _onOptionSelected( item ) {
    this.props.typeaheadSelect( item.key )
  }
}

ZipCode.propTypes = {
  debounceWait: PropTypes.number
}

ZipCode.defaultProps = {
  debounceWait: 250
}

export const mapStateToProps = state => {
  const options = state.aggs[FIELD_NAME] || []

  return {
    options,
    queryString: state.query.queryString,
    selections: state.query[FIELD_NAME] || []
  }
}

export const mapDispatchToProps = dispatch => ( {
  typeaheadSelect: value => {
    dispatch( addMultipleFilters( FIELD_NAME, [ value ] ) )
  }
} )

export default connect( mapStateToProps, mapDispatchToProps )( ZipCode )
