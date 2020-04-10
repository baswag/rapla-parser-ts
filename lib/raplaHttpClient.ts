import fetch from 'node-fetch';
import moment from 'moment';
import { RaplaEvent } from './raplaEvent';
import { RaplaParser } from './raplaParser';

/**
 * Main class which should be used when fetching RAPLA plans.
 */
export class RaplaHttpClient {
  parser: RaplaParser;

  /**
   *
   * @param baseUrl The Base url of the RAPLA Plan
   */
  constructor(public baseUrl: string) {
    this.parser = new RaplaParser();
  }

  /**
   * Fetches data for a week.
   * The given date is always set to the corresponding monday of the week with the week starting on sunday
   *
   * @param date A date in the week to be fetched
   */
  async getWeek(date: moment.Moment): Promise<RaplaEvent[]> {
    date = date.set('day', 1);
    const requestUrl = `${
      this.baseUrl
    }&day=${date.date()}&month=${date.month() + 1}&year=${date.year()}`;
    const res = await fetch(requestUrl);
    const body = await res.text();
    return this.parser.parseEvents(body, date);
  }

  /**
   * Fetches multiple weeks from rapla between the given dates.
   * Given dates are always set to the corresponding monday of the week with the week starting on sunday
   *
   * @param startDate A date in the week where fetching should begin
   * @param endDate A date in the week where fetching should end
   */
  async getWeeks(
    startDate: moment.Moment,
    endDate: moment.Moment
  ): Promise<RaplaEvent[]> {
    // Set the dates to a monday
    startDate = startDate.set('day', 1);
    endDate = endDate.set('day', 1);
    const allWeeks: Promise<RaplaEvent[]>[] = [];
    do {
      allWeeks.push(this.getWeek(startDate.clone()));
      startDate.add(7, 'days');
    } while (!startDate.isAfter(endDate));

    // Wait for all Promises to resolve and flatten the 2D-Array
    const results = (await Promise.all(allWeeks)) as any;
    return [].concat(...results);
  }

  /**
   * Fetches all weekly data starting from the date specified until no further data is available.
   * The given date is always set to the corresponding monday of the week with the week starting on sunday
   *
   * @param startDate The date to start fetching from
   * @param maxZero The maximum number of weeks to allow having no events
   */
  async getAll(startDate = moment(), maxZero = 15) {
    startDate = startDate.set('day', 1);

    let allWeeks: RaplaEvent[][] = [];
    let count = 0;
    while (true) {
      try {
        if (count > maxZero) {
          break;
        }
        const res = await this.getWeek(startDate.clone());
        if (res.length > 0) {
          count = 0;
        } else {
          count++;
        }
        allWeeks.push(res);
        startDate.add(7, 'days');
      } catch (e) {
        break;
      }
    }
    return [].concat(...(allWeeks as any));
  }
}
