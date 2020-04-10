import moment from 'moment';

/**
 * Interface for describing a Time interval defined by a start and end time
 */
export interface TimeInterval {
  start: moment.Moment;
  end: moment.Moment;
}

/**
 * A class describing a RAPLA Event
 */
export class RaplaEvent {
  constructor(
    public times: TimeInterval,
    public resources: string[],
    public persons: string,
    public title: string,
    public type: string
  ) {}

  set start(newDate: moment.Moment) {
    this.times.start = newDate;
  }

  get start(): moment.Moment {
    return this.times.start;
  }

  set end(newDate: moment.Moment) {
    this.times.end = newDate;
  }

  get end(): moment.Moment {
    return this.times.end;
  }

  /**
   * Get a list of courses for this event based on it's resources
   *
   * @param courseRegex The Regex to test the resources array against
   * @returns The Courses in this event
   */
  getCourses(courseRegex: RegExp): string[] {
    return this.resources.filter(resource => {
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
    return this.resources.filter(resource => {
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
