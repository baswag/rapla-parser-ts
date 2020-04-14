# rapla-parser-ts

A parser for the RAPLA timetable system.
It is based on the rapla-parser-js package but provides additional functionality and is completely written in Typescript.  
This library also uses cheerio instead of JSDOM to further increase the performance.

## Install

To install use  
`$ npm install rapla-parser-ts`

To use this package, moment is also needed:  
`$ npm install moment`

## Usage

```typescript
import { RaplaHttpClient } from 'rapla-parser-ts';

const raplaClient = new RaplaHttpClient('https://your-rapla-url/plan');

// usage in async functions or Typescript >= 3.8 with Top-Level await
const currentWeek = await raplaClient.getWeek(moment());

const nextSixWeeks = await raplaClient.getWeeks(
  moment(),
  moment().add(5, 'weeks')
);

// get all available Events starting from now
const allAvailableData = await raplaClient.getAll();

// get all available Events starting from next week
const allAvailableFromNext = await raplaClient.getAll(moment().add(1, 'weeks'));
```
