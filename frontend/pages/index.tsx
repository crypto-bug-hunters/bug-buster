import { useState } from "react";

function Header({ title }: { title: string }) {
  return <h1>{title}</h1>;
}

export default function HomePage() {
  const names = ["Lua", "Auction Dapp", "Dummy"];

  function handleClick() {
    console.log("Submit a new Bounty!!!");
  }

  return (
    <div>
      <Header title="Bug-Less 🚫🪳" />
      <ul>
        {names.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>

      <button onClick={handleClick}>Submit new Bounty</button>
    </div>
  );
}
