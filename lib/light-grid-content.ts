// Words and names for the homepage light grid.
// Words ignite one at a time, in this order, so write them as a story that connects.
// Names fire two at a time, in this order. The first name opens the page.
// Later these can move into Supabase so they're editable from the admin panel.

export type MemorialName = {
  name: string;
  age?: string;
  place?: string;
  year?: string;
  how?: string;
};

// The opening line that swells up from the center when the page loads.
export const LIGHT_GRID_INTRO = "IT'S OUR MOVE.";

export const LIGHT_GRID_WORDS: string[] = [
  "FROM THE BLOCK",
  "TO THE BOARDROOM",
  "CHICAGO",
  "INDIANAPOLIS",
  "WE MADE IT OUT",
  "NOW WE REACH BACK",
  "THE BLUEPRINT",
  "IS US",
  "OUR VOICES",
  "OUR STORIES",
  "DOCUMENTED",
  "THE CULTURE",
  "COLLECTIVE",
];

// Verify every line before it goes public.
export const LIGHT_GRID_NAMES: MemorialName[] = [
  { name: "Nolan Wells", age: "18", place: "Horn Island, MS", year: "2026", how: "Found dead two days after July 4th. Cause undetermined. His family is still asking what happened" },
  { name: "Kohen Wiley", age: "1", place: "Senatobia, MS", year: "2026", how: "Shot by police while his mother held him" },
  { name: "Sonya Massey", age: "36", place: "Springfield, IL", year: "2024", how: "Shot by a sheriff's deputy in her home" },
  { name: "Tyre Nichols", age: "29", place: "Memphis, TN", year: "2023", how: "Beaten by police, died three days later" },
  { name: "Herman Whitfield III", age: "39", place: "Indianapolis, IN", year: "2022", how: "Died in police custody in his parents' home" },
  { name: "Rayshard Brooks", age: "27", place: "Atlanta, GA", year: "2020", how: "Shot by police" },
  { name: "George Floyd", age: "46", place: "Minneapolis, MN", year: "2020", how: "Murdered by a police officer" },
  { name: "Dreasjon Reed", age: "21", place: "Indianapolis, IN", year: "2020", how: "Shot by police" },
  { name: "Breonna Taylor", age: "26", place: "Louisville, KY", year: "2020", how: "Shot by police in her home" },
  { name: "Ahmaud Arbery", age: "25", place: "Brunswick, GA", year: "2020", how: "Chased and shot by three white men" },
  { name: "Atatiana Jefferson", age: "28", place: "Fort Worth, TX", year: "2019", how: "Shot by police through her window" },
  { name: "Botham Jean", age: "26", place: "Dallas, TX", year: "2018", how: "Shot in his own apartment by an off-duty officer" },
  { name: "Philando Castile", age: "32", place: "Falcon Heights, MN", year: "2016", how: "Shot by police during a traffic stop" },
  { name: "Alton Sterling", age: "37", place: "Baton Rouge, LA", year: "2016", how: "Shot by police" },
  { name: "Sandra Bland", age: "28", place: "Waller County, TX", year: "2015", how: "Died in jail three days after a traffic stop" },
  { name: "Freddie Gray", age: "25", place: "Baltimore, MD", year: "2015", how: "Died from injuries in police custody" },
  { name: "Walter Scott", age: "50", place: "North Charleston, SC", year: "2015", how: "Shot in the back by police" },
  { name: "Tamir Rice", age: "12", place: "Cleveland, OH", year: "2014", how: "Shot by police at a playground" },
  { name: "Laquan McDonald", age: "17", place: "Chicago, IL", year: "2014", how: "Shot 16 times by Chicago police" },
  { name: "Michael Brown", age: "18", place: "Ferguson, MO", year: "2014", how: "Shot by police" },
  { name: "Eric Garner", age: "43", place: "Staten Island, NY", year: "2014", how: "Died in a police chokehold" },
  { name: "Trayvon Martin", age: "17", place: "Sanford, FL", year: "2012", how: "Shot by a neighborhood watch volunteer" },
  { name: "Rekia Boyd", age: "22", place: "Chicago, IL", year: "2012", how: "Shot by an off-duty Chicago detective" },
  { name: "Oscar Grant", age: "22", place: "Oakland, CA", year: "2009", how: "Shot by transit police" },
  { name: "Sean Bell", age: "23", place: "Queens, NY", year: "2006", how: "Shot by police the morning of his wedding" },
  { name: "James Byrd Jr.", age: "49", place: "Jasper, TX", year: "1998", how: "Murdered by white supremacists" },
  { name: "Fred Hampton", age: "21", place: "Chicago, IL", year: "1969", how: "Killed in a police raid while he slept" },
  { name: "Emmett Till", age: "14", place: "Money, MS", year: "1955", how: "Abducted and lynched by white men" },
];
