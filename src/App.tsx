import { useState } from "react";

export default function App() {
  const [name, setName] = useState("9999");

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>StoneAge EnemyBase Generator</h1>

      <div style={{ marginBottom: 20 }}>
        <label>이름: </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        생성 결과:
        <pre>
{`enemybase ${name || "9999"} 30 5.0`}
        </pre>
      </div>
    </div>
  );
}
