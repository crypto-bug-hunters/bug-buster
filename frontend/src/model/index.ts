export interface BugLessState {
  bounties: AppBounty[];
}

export interface Profile {
  address: string;
  name: string;
  imgLink: string;
}

export interface Exploit {
  hacker: Profile;
}

export interface Sponsorship {
  sponsor: Profile;
  value: number; //or big number?
}

export interface AppBounty {
  app: Profile;
  description: string;
  started: number; // (unix timestamp)
  deadline: number; // (unix timestamp)
  sponsorships: Sponsorship[];
  exploit: Exploit;
  codePath: string;
  inputIndex: number;
}
