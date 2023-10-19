export interface CreateBounty {
    Name: string;
    Description: string;
    ImgLink?: string;
    Deadline: number;
    CodeZipBinary: string;
}

export interface AddSponsorship {
    Name: string;
    ImgLink?: string;
    BountyIndex: number;
}
