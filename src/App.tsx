import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

const ELEMENT_ORDER = ["지", "수", "화", "풍"];

const ELEMENT_COLORS = {
  "지": "bg-lime-400",
  "수": "bg-sky-400",
  "화": "bg-red-500",
  "풍": "bg-yellow-400"
};

const OPPOSITE_RULES = {
  "지": "화",
  "화": "지",
  "수": "풍",
  "풍": "수"
};

const PRESETS = {
  "지 10": { 지: 10, 수: 0, 화: 0, 풍: 0 },
  "수 10": { 지: 0, 수: 10, 화: 0, 풍: 0 },
  "화 10": { 지: 0, 수: 0, 화: 10, 풍: 0 },
  "풍 10": { 지: 0, 수: 0, 화: 0, 풍: 10 },
  "화7 수3": { 지: 0, 수: 3, 화: 7, 풍: 0 }
};

function applyElementBias(weights, elementValues) {
  const [earth, water, fire, wind] = elementValues;
  const total = 10;

  return [
    weights[0] + (water / total) * 0.3,
    weights[1] + (fire / total) * 0.3,
    weights[2] + (earth / total) * 0.3,
    weights[3] + (wind / total) * 0.3
  ];
}

function randomStatSplit(total, concept, elementValues) {
  const baseWeights = {
    "공방형": [1, 1.4, 1.4, 0.8],
    "공순형": [0.8, 1.5, 0.7, 1.5],
    "탱커형": [1.6, 0.8, 1.6, 0.5],
    "밸런스형": [1, 1, 1, 1]
  };

  let weights = [...(baseWeights[concept] || baseWeights["밸런스형"])];

  if (concept === "밸런스형") {
    weights = weights.map(w => w + (Math.random() * 0.2 - 0.1));
  }

  weights = applyElementBias(weights, elementValues);

  const sum = weights.reduce((a, b) => a + b, 0);
  let values = weights.map(w => Math.floor((w / sum) * total));
  let diff = total - values.reduce((a, b) => a + b, 0);

  while (diff > 0) {
    values[Math.floor(Math.random() * 4)]++;
    diff--;
  }

  return values;
}

function validateElements(valuesObj) {
  const values = ELEMENT_ORDER.map(k => valuesObj[k]);
  const sum = values.reduce((a, b) => a + b, 0);

  if (sum !== 10) throw new Error("속성 총합은 반드시 10이어야 합니다.");
  if ((valuesObj["지"] > 0 && valuesObj["화"] > 0) ||
      (valuesObj["수"] > 0 && valuesObj["풍"] > 0)) {
    throw new Error("반대 속성은 함께 사용할 수 없습니다.");
  }

  return values;
}

function calculateBaseStats(stats, initialValue) {
  const [vit, str, tgh, dex] = stats;

  const vitCoef = (vit * initialValue) / 100;
  const strCoef = (str * initialValue) / 100;
  const tghCoef = (tgh * initialValue) / 100;
  const dexCoef = (dex * initialValue) / 100;

  return [
    Math.floor((vitCoef * 4) + strCoef + tghCoef + dexCoef),
    Math.floor((vitCoef * 0.1) + strCoef + (tghCoef * 0.1) + (dexCoef * 0.05)),
    Math.floor((vitCoef * 0.1) + (strCoef * 0.1) + tghCoef + (dexCoef * 0.05)),
    Math.floor(dexCoef)
  ];
}

export default function PetGenerator() {
  const [name, setName] = useState("");
  const [tempId, setTempId] = useState("");
  const [imageId, setImageId] = useState("100000");
  const [total, setTotal] = useState(100);
  const [initialValue, setInitialValue] = useState(30);
  const [concept, setConcept] = useState("밸런스형");
  const [elements, setElements] = useState({ 지: 0, 수: 0, 화: 10, 풍: 0 });
  const [captureDifficulty, setCaptureDifficulty] = useState(0);
  const [rarity, setRarity] = useState(0);
  const [result, setResult] = useState(null);
  const [overlay, setOverlay] = useState(null);

  const showOverlay = (msg) => {
    setOverlay(msg);
    setTimeout(() => setOverlay(null), 1500);
  };

  const clearElements = () => {
    setElements({ 지: 0, 수: 0, 화: 0, 풍: 0 });
  };

  const applyPreset = (preset) => {
    try {
      validateElements(preset);
      setElements(preset);
    } catch (e) {
      showOverlay(e.message);
    }
  };

  const handleElementClick = (element, value) => {
    const current = { ...elements };
    const active = ELEMENT_ORDER.filter(k => current[k] > 0);

    if (!current[element] && active.length >= 2) {
      showOverlay("속성은 최대 2개까지만 선택 가능합니다.");
      return;
    }

    const opposite = OPPOSITE_RULES[element];
    if (current[opposite] > 0 && value > 0) {
      showOverlay("반대 속성은 함께 선택할 수 없습니다.");
      return;
    }

    const totalCurrent = ELEMENT_ORDER.reduce((s, k) => s + current[k], 0);
    const diff = value - current[element];

    if (totalCurrent + diff > 10) {
      let excess = totalCurrent + diff - 10;
      for (let k of ELEMENT_ORDER) {
        if (k !== element && current[k] > 0 && excess > 0) {
          const reduce = Math.min(current[k], excess);
          current[k] -= reduce;
          excess -= reduce;
        }
      }
    }

    current[element] = value;
    setElements(current);
  };

  const generate = () => {
    try {
      const elementArray = validateElements(elements);
      const stats = randomStatSplit(Number(total), concept, elementArray);
      const baseStats = calculateBaseStats(stats, Number(initialValue));

      const finalName = name || "이름";
      const finalId = tempId || "9999";

      const enemybaseLine = `${finalName},컁,記,秊,므,制皐,${finalId},${initialValue},5.0,${stats[0]},${stats[1]},${stats[2]},${stats[3]},19,${captureDifficulty},${elementArray.join(",")},0,0,0,0,0,0,0,0,0,1,,,,,,${rarity},1,1,5,${imageId},1,1,,0,500,,0,500,,0,500,,0,500,,0,500,,0`;;

      setResult({ stats, baseStats, elementArray, enemybaseLine });
    } catch (err) {
      showOverlay(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 grid place-items-center relative">
      <AnimatePresence>
        {overlay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-black/85 text-white px-8 py-4 rounded-2xl shadow-2xl text-lg font-semibold">
              {overlay}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="w-[900px] rounded-2xl shadow-xl">
          <CardContent className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">펫 초기치 + enemybase 생성기</h1>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label>이름</label>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label>임시번호</label>
                <Input value={tempId} onChange={e => setTempId(e.target.value)} />
              </div>
              <div>
                <label>펫 이미지 번호</label>
                <Input value={imageId} onChange={e => setImageId(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="font-semibold">포획 난이도 (0~10)</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.from({ length: 11 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCaptureDifficulty(i)}
                    className={`px-3 py-1 rounded-xl border cursor-pointer transition-all duration-150 hover:scale-110 hover:shadow-md active:scale-95 ${
                      captureDifficulty === i ? "bg-black text-white" : "bg-white"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold">희귀도 (0~2)</label>
              <div className="flex gap-2 mt-2">
                {[0,1,2].map(i => (
                  <button
                    key={i}
                    onClick={() => setRarity(i)}
                    className={`px-4 py-1 rounded-xl border cursor-pointer transition-all duration-150 hover:scale-110 hover:shadow-md active:scale-95 ${
                      rarity === i ? "bg-purple-600 text-white" : "bg-white"
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label>총합 스탯</label>
              <Input type="number" value={total} onChange={e => setTotal(e.target.value)} />
            </div>

            <div>
              <label>초기수치</label>
              <Input type="number" value={initialValue} onChange={e => setInitialValue(e.target.value)} />
            </div>

            <div>
              <label>컨셉</label>
              <Select value={concept} onValueChange={setConcept}>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="공방형">공방형</SelectItem>
                  <SelectItem value="공순형">공순형</SelectItem>
                  <SelectItem value="탱커형">탱커형</SelectItem>
                  <SelectItem value="밸런스형">밸런스형</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold">속성 선택</label>

              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(PRESETS).map(([label, preset]) => (
                  <Button
                    key={label}
                    variant="outline"
                    onClick={() => applyPreset(preset)}
                    className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                  >
                    {label}
                  </Button>
                ))}
                <Button
                  variant="destructive"
                  onClick={clearElements}
                  className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
                >
                  전체 0
                </Button>
              </div>

              <div className="space-y-4">
                {ELEMENT_ORDER.map(el => (
                  <div key={el} className="space-y-2">
                    <div className={`px-3 py-1 rounded-xl text-white font-bold ${ELEMENT_COLORS[el]}`}>
                      {el} ({elements[el]})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 11 }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handleElementClick(el, i)}
                          className={`px-3 py-1 rounded-xl border cursor-pointer transition-all duration-150 hover:scale-110 hover:shadow-md active:scale-95 ${
                            elements[el] === i ? "bg-black text-white" : "bg-white"
                          }`}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={generate}
              className="w-full cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              생성
            </Button>

            {result && (
              <div className="space-y-3 pt-4 border-t text-sm">
                <div>
                  기초 분배 → 체:{result.stats[0]} 공:{result.stats[1]} 방:{result.stats[2]} 순:{result.stats[3]}
                </div>
                <div>
                  1레벨 초기치 → 체:{result.baseStats[0]} 공:{result.baseStats[1]} 방:{result.baseStats[2]} 순:{result.baseStats[3]}
                </div>
                <div>
                  속성 → 지:{result.elementArray[0]} 수:{result.elementArray[1]} 화:{result.elementArray[2]} 풍:{result.elementArray[3]}
                </div>
                <div>
                  <label className="font-medium">enemybase 출력</label>
                  <textarea
                    className="w-full h-32 p-2 border rounded-2xl text-xs"
                    value={result.enemybaseLine}
                    readOnly
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
