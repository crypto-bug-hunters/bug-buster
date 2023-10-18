export interface BugLessState {
  Bounties: AppBounty[];
}

export interface AppBounty {
  Developer: Profile;
  Description: string;
  Started: number;
  Deadline: number;
  InputIndex: number;
  Sponsorships: Sponsorship[];
  Exploit: Exploit;
  Withdrawn: boolean;
}

export interface Profile {
  Address: string;
  Name: string;
  ImgLink: string;
}

export interface Exploit {
  Hacker: Profile;
  InputIndex: number;
}

export interface Sponsorship {
  Sponsor: Profile;
  Value: string; // number encoded as hex string
}
