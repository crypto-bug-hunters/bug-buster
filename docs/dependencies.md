## Dependencies

For your purposes, not all dependencies may be required.
To help you figure out which dependencies you actually need, here is a tree of dependencies for each part of the code base.

```mermaid
flowchart LR

    %% External Dependencies

    classDef dependency fill:#008DA5,color:#fff

    bash:::dependency
    docker:::dependency
    cast:::dependency
    go:::dependency
    jq:::dependency
    make:::dependency
    pnpm:::dependency
    tar:::dependency
    xz:::dependency

    %% Bug Buster Components

    classDef component fill:#00F6FF,color:#000

    BackEnd:::component
    Shell:::component
    BountyExamples:::component
    Tests:::component
    PopulateScript:::component
    CLI:::component
    FrontEnd:::component

    %% Components -> Dependencies

    BackEnd --> docker
    BackEnd --> pnpm
    Shell --> BackEnd
    Shell --> docker
    Shell --> make
    BountyExamples --> make
    BountyExamples --> tar
    BountyExamples --> xz
    Tests ---> docker
    Tests ---> make
    Tests --> BountyExamples
    PopulateScript ---> bash
    PopulateScript ---> cast
    PopulateScript ---> jq
    PopulateScript ---> pnpm
    PopulateScript --> BountyExamples
    PopulateScript --> CLI
    CLI --> cast
    CLI --> go
    FrontEnd ---> pnpm
```
