import { useState } from "react";
import InfiniteCanvas from "./components/InfiniteCanvas";
import { motion, AnimatePresence } from "framer-motion";
import { fadeAnimation, slideAnimation } from "./config/motion";

const App = () => {
  const [showIntro, setShowIntro] = useState(true);
  return (
    <AnimatePresence>
      <motion.div
        className={`${
          showIntro ? "grid grid-cols-2 items-center ml-[5%]" : "block w-full"
        } h-screen transition-all ease-in`}
      >
        {showIntro && (
          <motion.div className="w-full" {...slideAnimation("left")}>
            <h1 className="text-6xl font-black">Your Network Marketing Tool</h1>
            <p className="py-6">
              This tool helps you manage to networking (team structure) by
              giving you the opportunity to draw your team structure on your
              phone. The following are the keyboard shortcuts compatible with
              this software:
            </p>
            <ul>
              <li>Crtl + D - Duplicate</li>
              <li>Crtl + Y - Redo</li>
              <li>Crtl + Z - Undo</li>
            </ul>
            <button
              onClick={() => setShowIntro(false)}
              className="border border-black px-4 py-2 rounded-md mt-4"
            >
              Use Now
            </button>
          </motion.div>
        )}
        <motion.div
          className="relative w-full h-screen"
          {...slideAnimation("right")}
        >
          <InfiniteCanvas showIntro={showIntro} setShowIntro={setShowIntro} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default App;

// // When you hover on a tool show the name of the tool

// import { useState } from "react";
// import { motion } from "framer-motion";
// import InfiniteCanvas from "./components/InfiniteCanvas";

// const App = () => {
//   const [intro, setIntro] = useState(true);

//   const containerVariants = {
//     initial: {
//       opacity: 0,
//       scale: 0.9,
//     },
//     animate: {
//       opacity: 1,
//       scale: 1,
//       transition: {
//         duration: 0.5,
//       },
//     },
//   };

//   const introVariants = {
//     initial: {
//       opacity: 0,
//       x: "-100vw",
//     },
//     animate: {
//       opacity: 1,
//       x: 0,
//       transition: {
//         type: "spring",
//         stiffness: 50,
//       },
//     },
//     exit: {
//       opacity: 0,
//       x: "100vw",
//       transition: {
//         duration: 0.5,
//       },
//     },
//   };

//   const canvasVariants = {
//     initial: {
//       opacity: 0,
//       x: "100vw",
//     },
//     animate: {
//       opacity: 1,
//       x: 0,
//       transition: {
//         type: "spring",
//         stiffness: 50,
//       },
//     },
//     expanded: {
//       width: "100%",
//       transition: {
//         duration: 0.5,
//       },
//     },
//   };

//   return (
//     <motion.div
//       className={`${
//         intro ? "grid grid-cols-2 items-center ml-[5%]" : "block w-full"
//       }`}
//       variants={containerVariants}
//       initial="initial"
//       animate="animate"
//     >
//       {intro && (
//         <motion.div
//           className="w-full"
//           variants={introVariants}
//           initial="initial"
//           animate="animate"
//           exit="exit"
//         >
//           <h1 className="text-6xl font-black">Your Network Marketing Tool</h1>
//           <p className="py-6">
//             Lorem ipsum dolor, sit amet consectetur adipisicing elit. Autem
//             officiis quae a, iure blanditiis quia consequuntur commodi
//             consectetur necessitatibus maxime dicta, molestiae quam quo suscipit
//             quod ut dolor obcaecati modi?
//           </p>
//           <button
//             onClick={() => setIntro(false)}
//             className="border border-black px-4 py-2 rounded-md mt-4"
//           >
//             Use Now
//           </button>
//         </motion.div>
//       )}
//       <motion.div
//         className="relative w-full"
//         variants={canvasVariants}
//         initial="initial"
//         animate={intro ? "initial" : "expanded"}
//       >
//         {!setIntro && <button onClick={() => setIntro(true)}>Back</button>}

//         <InfiniteCanvas />
//       </motion.div>
//     </motion.div>
//   );
// };

// export default App;
