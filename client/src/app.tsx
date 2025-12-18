import { useState } from 'preact/hooks';
import './app.css';

export function App() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const sendAction = (action: object) => {
    const ws = new WebSocket('ws://localhost:3030/ws');
    ws.onopen = () => {
      ws.send(JSON.stringify(action));
      ws.close();
    };
  };

  const handleMove = () => {
    sendAction({ type: 'move', x, y });
  };

  const handleClick = (button: string) => {
    sendAction({ type: 'click', button });
  };

  return (
    <div class="app">
      <h1>Mouse Controller</h1>
      <div class="controls">
        <div>
          <label>
            X:
            <input
              type="number"
              value={x}
              onChange={(e) => setX(Number(e.target.value))}
            />
          </label>
          <label>
            Y:
            <input
              type="number"
              value={y}
              onChange={(e) => setY(Number(e.target.value))}
            />
          </label>
          <button onClick={handleMove}>Move</button>
        </div>
        <div>
          <button onClick={() => handleClick('left')}>Left Click</button>
          <button onClick={() => handleClick('right')}>Right Click</button>
          <button onClick={() => handleClick('middle')}>Middle Click</button>
        </div>
      </div>
    </div>
  );
}
