import { useState } from "react";

type ElementKey = "earth" | "water" | "fire" | "wind";

const elementMeta = {
  earth: { label: "지", color: "#9acd32" },
  water: { label: "수", color: "#87ceeb" },
  fire: { label: "화", color: "#ff4d4f" },
  wind: { label: "풍", color: "#ffd700" }
};

export default function App() {
  const [name, setName] = useState("");
  const [tempId, setTempId] = useState("");
  const [totalStat, setTotalStat] = useState(100);
  const [capture, setCapture] = useState(0);
  const [rarity, setRarity] = useState(0);
  const [imageId, setImageId] = useState("100000");

  const [elements, setElements] = useState<Record<ElementKey, number>>({
    earth: 0,
    water: 0,
    fire: 0,
    wind: 0
  });

  const [warning, setWarning] = useState("");

  const showWarning = (msg: string) => {
    setWarning(msg);
    setTimeout(() => setWarning(""), 2000);
  };

  const handleElementClick = (key: ElementKey, value: number) => {
    const newElements = { ...elements };
    const totalOthers =
      Object.entries(newElements)
        .filter(([k]) => k !== key)
        .reduce((sum, [, v]) => sum + v, 0);

    if (totalOthers + value > 10) {
      const remain = 10 - totalOthers;
      newElements[key] = remain;
    } else {
      newElements[key] = value;
    }

    const active = Object.values(newElements).filter(v => v > 0).length;

    if (active > 2) {
      showWarning("속성은 최대 2개까지 가능합니다.");
      return;
    }

    if (
      (newElements.earth > 0 && newElements.fire > 0) ||
      (newElements.water > 0 && newElements.wind > 0)
    ) {
      showWarning("반대 속성은 함께 설정할 수 없습니다.");
      return;
    }

    setElements(newElements);
  };

  const resetElements = () => {
    setElements({ earth: 0, water: 0, fire: 0, wind: 0 });
  };

  const presetElement = (preset: Record<ElementKey, number>) => {
    setElements(preset);
  };

  const generateStats = () => {
    const base = Math.floor(totalStat / 4);
    let stats = [base, base, base, base];
    let remain = totalStat - base * 4;

    while (remain > 0) {
      stats[Math.floor(Math.random() * 4)]++;
      remain--;
    }

    stats = stats.map(v => v + Math.floor(Math.random() * 3) - 1);

    const elementBoost = {
      hp: elements.water * 0.5,
      atk: elements.fire * 0.5,
      def: elements.earth * 0.5,
      spd: elements.wind * 0.5
    };

    return {
      hp: Math.max(1, Math.floor(stats[0] + elementBoost.hp)),
      atk: Math.max(1, Math.floor(stats[1] + elementBoost.atk)),
      def: Math.max(1, Math.floor(stats[2] + elementBoost.def)),
      spd: Math.max(1, Math.floor(stats[3] + elementBoost.spd))
    };
  };

  const stats = generateStats();

  const hpCoef = stats.hp * 30 / 100;
  const atkCoef = stats.atk * 30 / 100;
  const defCoef = stats.def * 30 / 100;
  const spdCoef = stats.spd * 30 / 100;

  const hpInit = (hpCoef * 4) + atkCoef + defCoef + spdCoef + 30;
  const atkInit = (hpCoef * 0.1) + atkCoef + (defCoef * 0.1) + (spdCoef * 0.05) + 30;
  const defInit = (hpCoef * 0.1) + (atkCoef * 0.1) + defCoef + (spdCoef * 0.05) + 30;
  const spdInit = spdCoef + 30;

  const enemybase = `
enemybase ${name || "9999"} ${tempId || "9999"}
${Math.floor(hpInit)} ${Math.floor(atkInit)} ${Math.floor(defInit)} ${Math.floor(spdInit)}
capture ${capture}
rarity ${rarity}
image ${imageId}
materials 컁 記 秊 므 制皐
growth 5.0
`;

  return (
    <div style={{ padding: 30, fontFamily: "sans-serif" }}>
      {warning && (
        <div style={{
          position: "fixed",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "black",
          color: "white",
          padding: "20px 40px",
          borderRadius: 10,
          zIndex: 9999
        }}>
          {warning}
        </div>
      )}

      <h1>StoneAge EnemyBase Generator</h1>

      <div>
        이름: <input value={name} onChange={e => setName(e.target.value)} />
        임시번호: <input value={tempId} onChange={e => setTempId(e.target.value)} />
      </div>

      <div style={{ marginTop: 10 }}>
        총 스탯 합:
        <input
          type="number"
          value={totalStat}
          onChange={e => setTotalStat(Number(e.target.value))}
        />
      </div>

      <h3>속성</h3>
      {(Object.keys(elements) as ElementKey[]).map(key => (
        <div key={key} style={{ marginBottom: 10 }}>
          <span style={{
            color: elementMeta[key].color,
            fontWeight: "bold"
          }}>
            {elementMeta[key].label}
          </span>
          {[...Array(11)].map((_, i) => (
            <button
              key={i}
              onClick={() => handleElementClick(key, i)}
              style={{
                margin: 3,
                padding: "5px 8px",
                cursor: "pointer",
                transition: "0.2s",
                transform: elements[key] === i ? "scale(1.2)" : "scale(1)"
              }}
            >
              {i}
            </button>
          ))}
        </div>
      ))}

      <button onClick={resetElements}>속성 초기화</button>
      <button onClick={() => presetElement({ earth: 10, water: 0, fire: 0, wind: 0 })}>지10</button>
      <button onClick={() => presetElement({ earth: 0, water: 10, fire: 0, wind: 0 })}>수10</button>
      <button onClick={() => presetElement({ earth: 0, water: 0, fire: 10, wind: 0 })}>화10</button>
      <button onClick={() => presetElement({ earth: 0, water: 0, fire: 0, wind: 10 })}>풍10</button>
      <button onClick={() => presetElement({ earth: 0, water: 3, fire: 7, wind: 0 })}>화7 수3</button>

      <h3>포획 난이도</h3>
      {[...Array(11)].map((_, i) => (
        <button key={i} onClick={() => setCapture(i)}>{i}</button>
      ))}

      <h3>희귀도</h3>
      {[0, 1, 2].map(i => (
        <button key={i} onClick={() => setRarity(i)}>{i}</button>
      ))}

      <h3>펫 이미지 번호</h3>
      <input value={imageId} onChange={e => setImageId(e.target.value)} />

      <h2>enemybase 결과</h2>
      <pre>{enemybase}</pre>
    </div>
  );
}
