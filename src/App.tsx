/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import PhaserGame from './components/PhaserGame';

export default function App() {
  return (
    <div className="w-screen h-screen bg-black text-white font-sans overflow-hidden touch-none select-none">
      <PhaserGame />
    </div>
  );
}
