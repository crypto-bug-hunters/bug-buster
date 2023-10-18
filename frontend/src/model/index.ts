export interface BugLessState {
  Bounties: AppBounty[];
}

export interface Profile {
  Address: string;
  Name: string;
  ImgLink: string;
}

export interface Exploit {
  Hacker: Profile;
}

export interface Sponsorship {
  Sponsor: Profile;
  Value: number; //or big number?
}

export interface AppBounty {
  App: Profile;
  Description: string;
  Started: number; // (unix timestamp)
  Deadline: number; // (unix timestamp)
  Sponsorships: Sponsorship[];
  Exploit: Exploit;
  CodePath: string;
  InputIndex: number;
}
