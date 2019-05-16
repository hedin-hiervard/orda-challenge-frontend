/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 */

import React from 'react';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import moment from 'moment'

const GET_DAYS = gql`
  {
    days {
      startTimestamp
    }
  }
`;

const GET_VENUES = gql`
  {
    venues {
      id
      name
    }
  }
`;

const SEND_REPORT = gql`
  mutation sendReport(
    $email: String!
    $venueId: String!
    $dayStartTimestamp: String!
  ) {
    sendReport(
      email: $email
      venueId: $venueId
      dayStartTimestamp: $dayStartTimestamp
    ) {
      success
      msg
    }
  }
`;

const DaySelector = ({ onChange }) => (
  <Query query={GET_DAYS}>
    {({ loading, error, data }) => {
      if (loading) return 'Loading...';
      if (error) return `Error! ${error.message}`;

      return (
        <select
          name="day"
          onChange={e => onChange(e.target.value)}
        >
          {data.days.map(day => (
            <option key={day.startTimestamp} value={day.startTimestamp}>
              {moment.unix(day.startTimestamp).format('MMMM Do YYYY')}
            </option>
          ))}
        </select>
      );
    }}
  </Query>
);

const VenueSelector = ({ onChange }) => (
  <Query query={GET_VENUES}>
    {({ loading, error, data }) => {
      if (loading) return 'Loading data';
      if (error) return `Error: ${error.message}!`;

      return (
        <select
          name="venue"
          onChange={ e => onChange(e.target.value)}
        >
          {data.venues.map(venue => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>
      );
    }}
  </Query>
);

export default class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      venueId: '',
      dayStartTimestamp: '',
    };
  }

  render() {
    return (
      <Mutation mutation={SEND_REPORT}>
        {(sendReport, { loading, data, error }) => {
          return (
            <p>
              { loading && 'Generating the report...' }
              { error && `Error: ${error.message}!` }
              { data && data.sendReport.success && `Report sent successfully`}
              { data && !data.sendReport.success && `Failed to send report: ${data.sendReport.msg}`}

              <p>
                <DaySelector onChange={dayStartTimestamp => this.setState({ dayStartTimestamp })} />
              </p>
              <p>
                <VenueSelector onChange={venueId => this.setState({ venueId })} />
              </p>
              <p>
                <input
                  type="email"
                  onChange={e => this.setState({ email: e.target.value })}
                />
              </p>
              <p>
                <button
                  type="submit"
                  onClick={() =>
                    sendReport({
                      variables: {
                        email: this.state.email,
                        venueId: this.state.venueId,
                        dayStartTimestamp: this.state.dayStartTimestamp,
                      },
                    })
                  }
                >
                  Generate Report
                </button>
              </p>
            </p>
          );
        }
      }
      </Mutation>
    );
  }
}
