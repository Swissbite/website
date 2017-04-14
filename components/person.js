import React, { Component } from 'react'
import PropTypes from 'prop-types'

import InternalLink from './link'

class Person extends Component {
  render () {
    const photo = this.props.detail ? <InternalLink {...this.props} classes="person__image-container">
      <img className="person__image" src={this.props.photo} alt={this.props.name} />
    </InternalLink> : <img className="person__image" src={this.props.photo} alt={this.props.name} />

    const twitter = this.props.twitter ? <p>
      <a href={'https://twitter.com/' + this.props.twitter}>
        {'@' + this.props.twitter}
      </a>
    </p> : null

    let content = <div>
      <span className="person__name">
        {this.props.name}
      </span>
      <span className="person__job-title">
        {this.props.description}
      </span>
    </div>

    if (this.props.detail) {
      content = <InternalLink {...this.props} classes="person__link">
        {content}
      </InternalLink>
    }

    return <div className="person">
      {photo}

      <div className="person__caption">
        <h3 className="person__title">
          {content}
          {twitter}
        </h3>
      </div>
    </div>
  }
}

Person.propTypes = {
  name: PropTypes.string,
  photo: PropTypes.string,
  description: PropTypes.string,
  detail: PropTypes.string,
  twitter: PropTypes.string
}

export default Person