import { RaplaEvent } from './raplaEvent';
import cheerio from 'cheerio';
import * as Moment from 'moment';
import { extendMoment, DateRange } from 'moment-range';

const moment = extendMoment(Moment);

/**
 * A RAPLA Parser using cheerio
 */
export class RaplaParser {
  $: CheerioStatic = {} as CheerioStatic;

  /**
   * Given an anchor element, this function parses the exact start and end times of an RAPLA event
   *
   * @param element The parent element for an event
   * @param date The date on which the event takes place
   */
  parseTimes(element: CheerioElement, date: Moment.Moment): DateRange {
    let time = '08:00-20:00';
    const firstNode = element.firstChild;

    if (firstNode.type === 'text') {
      time = firstNode.data?.replace(/\s/g, '') ?? '08:00-20:00';
    }

    // If no time was found, set it to 08:00-20:00
    if (time === '08:00-20:00') {
      const res = date.clone();
      res.set('hours', 8).set('minutes', 0);
      return moment.range(res, res.clone().set('hours', 20));
    }

    const times = time.split('-');
    const start = date.clone();
    const firstSplit = times[0].split(':');
    start.set('hours', parseInt(firstSplit[0], 10));
    start.set('minutes', parseInt(firstSplit[1], 10));

    const end = date.clone();

    // Some events don't have an end time, so catch those and set it to 20:00
    try {
      const secondSplit = times[1].split(':');
      end.set('hours', parseInt(secondSplit[0], 10));
      end.set('minutes', parseInt(secondSplit[1], 10));
    } catch (e) {
      end.set('hours', 20).set('minutes', 0);
    }

    return moment.range(start, end);
  }

  /**
   * Given an Anchor Element, this methord parses a single RAPLA Event
   *
   * @param element The parent element for an event
   * @param date The date on which the event takes place
   */
  parseEvent(element: CheerioElement, date: Moment.Moment): RaplaEvent {
    const times = this.parseTimes(element, date);
    let title = 'N/A';
    let persons = 'N/A';
    let resources: string[] = [];
    const labels = this.$(
      'span.tooltip table.infotable tbody tr td.label',
      element
    ).toArray();
    const values = this.$(
      'span.tooltip table.infotable tbody tr td.value',
      element
    ).toArray();

    // Parse the labels and values
    for (const i in labels) {
      switch (labels[i].firstChild?.data) {
        case 'Titel:':
          title = values[i].firstChild.data ?? 'N/A';
          break;
        case 'Personen:':
          persons = values[i].firstChild.data ?? 'N/A';
          break;
        case 'Ressourcen:':
          resources = values[i].firstChild.data?.split(',') ?? [];
          break;
      }
    }
    let type = this.$('span.tooltip strong', element).toArray()[0]?.firstChild
      ?.data;
    return new RaplaEvent(times, resources, persons, title, type ?? 'N/A');
  }

  /**
   * Parse all events in a weekly RAPLA schedule
   *
   * @param htmlText The string containing the HTML Text
   * @param date The date on which this week starts (monday)
   */
  parseEvents(htmlText: string, date: Moment.Moment): RaplaEvent[] {
    let tempDate = date.clone();
    const res: RaplaEvent[] = [];
    this.$ = cheerio.load(htmlText);
    const weekTableRows = this.$('table.week_table > tbody > tr').toArray();
    for (const row of weekTableRows) {
      for (const childNode of row.childNodes) {
        if (childNode.attribs?.class === 'week_block') {
          const anchor = this.$('a', childNode);
          if (anchor) {
            res.push(this.parseEvent(anchor.toArray()[0], tempDate.clone()));
          }
        } else if (
          childNode.attribs?.class === 'week_separatorcell' ||
          childNode.attribs?.class === 'week_separatorcell_black'
        ) {
          // Reached the end of a day, add 1 day
          tempDate.add(1, 'days');
        }
      }
      // Reset the day as the end of one row was reached
      tempDate = date.clone();
    }
    return res;
  }
}
