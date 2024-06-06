import { useState } from "react";
import InfiniteCanvas from "./components/InfiniteCanvas";

const App = () => {
  const [intro, setIntro] = useState(true);
  return (
    <div
      className={`${
        intro ? "grid grid-cols-2 items-center ml-[5%]" : "block w-full"
      }`}
    >
      {intro && (
        <div className="w-full">
          <h1 className="text-6xl font-black">Your Network Marketing Tool</h1>
          <p className="py-6">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Autem
            officiis quae a, iure blanditiis quia consequuntur commodi
            consectetur necessitatibus maxime dicta, molestiae quam quo suscipit
            quod ut dolor obcaecati modi?
          </p>
          <button
            onClick={() => setIntro(false)}
            className="border border-black px-4 py-2 rounded-md mt-4"
          >
            Use Now
          </button>
        </div>
      )}
      <div className="relative w-full">
        <InfiniteCanvas />
      </div>
    </div>
  );
};

export default App;

// When you hover on a tool show the name of the tool
