import Moment from 'moment';
import { extendMoment, DateRange } from 'moment-range';

const moment = extendMoment(Moment as any);
/**
 * A class describing a RAPLA Event
 */
export class RaplaEvent {
  constructor(
    public times: DateRange,
    public resources: string[],
    public persons: string,
    public title: string,
    public type: string
  ) {}

  set start(newDate: Moment.Moment) {
    this.times.start = newDate;
  }

  get start(): Moment.Moment {
    return this.times.start;
  }

  set end(newDate: Moment.Moment) {
    this.times.end = newDate;
  }

  get end(): Moment.Moment {
    return this.times.end;
  }

  /**
   * Get a list of courses for this event based on it's resources
   *
   * @param courseRegex The Regex to test the resources array against
   * @returns The Courses in this event
   */
  getCourses(courseRegex: RegExp): string[] {
    return this.resources.filter((resource) => {
      return courseRegex.test(resource);
    });
  }

  /**
   * Get a list of rooms for this event based on it's resources
   *
   * @param roomRegex The Regex to test the resources array against
   * @returns The Rooms in this event
   */
  getRooms(roomRegex: RegExp): string[] {
    return this.resources.filter((resource) => {
      return roomRegex.test(resource);
    });
  }

  /**
   * Check if the event starts after today
   *
   * @returns Is the event current?
   */
  isCurrent(): boolean {
    if (this.start === undefined) {
      return false;
    }

    return this.start >= moment().startOf('day');
  }

  /**
   * Check if the event types is of the given type.
   *
   * @param type Is the event of the given type
   * @returns Is the event of a given type?
   */
  isType(type: string): boolean {
    if (this.type === undefined) {
      return false;
    }

    return this.type.indexOf(type) > -1;
  }
}
