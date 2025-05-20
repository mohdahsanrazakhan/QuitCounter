import { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { BsPencilSquare } from "react-icons/bs";
import { formatDistanceToNow } from 'date-fns';

const getInitialData = () => {
  const data = localStorage.getItem("addictions");
  return data ? JSON.parse(data) : [];
};

const getToday = (offsetDays = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split("T")[0];
};

const App = () => {
  const [addictions, setAddictions] = useState(getInitialData);
  const [newAddiction, setNewAddiction] = useState("");
  const [simulatedOffset, setSimulatedOffset] = useState(0);
  const [currentDate, setCurrentDate] = useState(getToday(simulatedOffset));
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");



  useEffect(() => {
    localStorage.setItem("addictions", JSON.stringify(addictions));
  }, [addictions]);

  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    setAddictions((prev) =>
      prev.map((item) => {
        const lastUpdatedDate = new Date(item.lastUpdated);
        const startDate = new Date(item.startDate);

        // Only update if last updated is before today
        if (lastUpdatedDate < today) {
          const diffTime = today.getTime() - startDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          return {
            ...item,
            streak: diffDays + 1, // Including start day
            lastUpdated: todayStr,
          };
        }

        return item;
      })
    );
  }, []);



  const handleAdd = () => {
    if (newAddiction.trim() === "") return;

    const today = new Date().toISOString();

    const newItem = {
      id: Date.now(),
      name: newAddiction,
      streak: 0,
      startedOn: today,
      lastUpdated: today,
      history: [],
    };

    setAddictions([...addictions, newItem]);
    setNewAddiction("");
  };

  const handleBreakStreak = (id) => {
    const today = new Date().toISOString().split("T")[0];

    setAddictions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
            ...item,
            history: [
              ...item.history,
              {
                start: item.startedOn,
                end: today,
                streak: item.streak,
              },
            ],
            streak: 0,
            startedOn: today,
            lastUpdated: today,
          }
          : item
      )
    );
  };

  const handleIncrementStreaks = () => {
    const nextOffset = simulatedOffset + 1;
    const nextDate = getToday(nextOffset);
    setSimulatedOffset(nextOffset);
    setCurrentDate(nextDate);

    setAddictions((prev) =>
      prev.map((item) =>
        item.lastUpdated !== nextDate
          ? {
            ...item,
            streak: item.streak + 1,
            lastUpdated: nextDate,
          }
          : item
      )
    );
  };

  const startEdit = (id, name) => {
    setEditingId(id);
    setEditValue(name);
  };

  const saveEdit = (id) => {
    setAddictions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, name: editValue } : item
      )
    );
    setEditingId(null);
    setEditValue("");
  };

  return (
    <div className="min-h-screen p-6 bg-blue-50 text-gray-800">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Quit Addiction Tracker
        </h1>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="flex-1 p-2 border rounded"
            placeholder="Enter addiction (e.g., Smoking)"
            value={newAddiction}
            onChange={(e) => setNewAddiction(e.target.value)}
          />
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            <FiPlus className="text-xl" />
          </button>
        </div>

        {/*<button
          onClick={handleIncrementStreaks}
          className="mb-4 text-sm underline text-blue-700"
        >
          Simulate New Day (Increment Streaks)
        </button>*/}

        {addictions.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 mb-4 rounded shadow border"
          >
            <div className="flex justify-between items-center mb-2">
              {/* <div>
                <p className="text-lg font-semibold">{item.name}</p>
                <p className="flex items-center gap-1 text-sm text-gray-500">
                  Streak: <FaFire className="text-orange-600" /> {item.streak} day(s)
                </p>
              </div> */}
              <li key={item.id} className="flex items-center gap-2.5">
                {editingId === item.id ? (
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => saveEdit(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(item.id);
                    }}
                    autoFocus
                    className="py-1 px-2 text-[1rem]"
                  />
                ) : (
                  <>
                    <span>{item.name}</span>
                    <button onClick={() => startEdit(item.id, item.name)}>
                      <BsPencilSquare />
                    </button>
                  </>
                )}
                {item.startedOn ? (
                <span className="ml-auto">
                  🔥 {item.streak === 0 || isNaN(Number(item.streak)) ? 1 : item.streak} day{item.streak === 1 || item.streak === 0 ? "" : "s"}
                  <br />
                  <small className="text-gray-500">
                    Started {formatDistanceToNow(new Date(item.startedOn), { addSuffix: true })}
                  </small>
                </span>
                ) : (
                  <span className="ml-auto text-sm text-gray-400">No start date</span>
                )}

              </li>
              <button
                onClick={() => handleBreakStreak(item.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Break Streak
              </button>
            </div>

            {item.history.length > 0 && (
              <div className="bg-gray-100 p-2 rounded text-sm">
                <p className="font-semibold mb-1">Previous Streaks:</p>
                <ul className="list-disc pl-5">
                  {item.history.map((h, i) => (
                    <li key={i}>
                      {h.start} → {h.end} ({h.streak} days)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
