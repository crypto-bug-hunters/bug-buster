export interface BugLessState {
  Bounties: AppBounty[];
}

export interface AppBounty {
  Developer: Profile; // Name and ImgLink are related to the App
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
  Code: string | undefined;
}

export interface Sponsorship {
  Sponsor: Profile;
  Value: string; // number encoded as hex string
}

export interface SendExploit {
  BountyIndex: number;
  Name: string;
  ImgLink: string;
  Exploit: string;
}
