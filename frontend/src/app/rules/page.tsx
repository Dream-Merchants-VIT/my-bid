"use client"

import Image from "next/image";
import { useRouter } from "next/navigation";


export default function RulesPage() {

    const router = useRouter();

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/images/background.png')" }}
        >
            {/* Wooden Frame Container */}
            <div
                className="relative w-[70%] max-w-5xl min-h-[80vh] p-6 flex flex-col items-center justify-start rounded-lg shadow-xl"
                style={{
                    backgroundImage: "url('/assets/images/main-background.png')",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                }}
            >
                {/* Heading */}
                <div className="text-center mb-6 w-[40%] max-w-screen-sm px-4">
                    <Image
                        src="/assets/images/rules/heading.png"
                        alt="Rules"
                        width={300}
                        height={40}
                        className="w-full h-auto object-contain"
                    />
                </div>

                {/* Rules Content */}
                <div
                    className="w-full max-w-screen-lg p-4 overflow-y-auto text-yellow-100 font-mono text-sm sm:text-base leading-relaxed"
                    style={{
                        backgroundImage: "url(/rectangle-background.png)",
                        backgroundSize: "cover",
                    }}
                >
                    {/* Team Formation */}
                    <h2 className="text-yellow-300 font-bold text-lg mb-2">Team Formation</h2>
                    <ul className="list-decimal list-inside mb-4">
                        <li>Each team must consist of 3-5 members.</li>
                        <li>Each team will receive 1500 tokens credited into their admin portal at the start of the event.</li>
                    </ul>

                    {/* Stage 1 */}
                    <h2 className="text-yellow-300 font-bold text-lg mb-2">Stage 1: Raw Material Bidding</h2>
                    <ul className="list-decimal list-inside mb-4">
                        <li>Teams must bid for raw materials required to construct properties on the online platform.</li>
                        <li>Raw materials include: Bricks, Cement, Steel, Wood, Glass, Medical Supplies, Pipes, Wires, Furniture, Tiles, Marble/Granite.</li>
                        <li>Bundles are available in two types: large and small (except the bonus-point material).</li>
                        <li>Teams will be notified with a <span className="text-blue-400">Blue Alert</span> when 20 bundles remain and a <span className="text-red-400">Red Alert</span> when 5 bundles remain (only two notifications in total).</li>
                        <li>Each bid will have a strict 30-second time limit; no extra time will be provided.</li>
                        <li>All team members may view the inventory, but only the team leader has permission to edit.</li>
                    </ul>

                    {/* Stage 2 */}
                    <h2 className="text-yellow-300 font-bold text-lg mb-2">Stage 2: Internal Trading</h2>
                    <ul className="list-decimal list-inside mb-4">
                        <li>Each team receives an additional 500 tokens, usable in both Stage 2 and Stage 3.</li>
                        <li>All trades must happen at the mediator's desk.</li>
                        <li>Team leaders are responsible for conducting trades on behalf of their team.</li>
                        <li>Leaders must first negotiate with another team before finalizing a trade.</li>
                        <li>All trades are carried out using tokens as the currency.</li>
                        <li>The mediator must approve each trade to ensure fairness.</li>
                        <li>Each team may conduct a maximum of 6 trades in total: 3 sales (material for tokens) and 3 purchases (tokens for material).</li>
                        <li>Any amount of a single material counts as one trade.</li>
                        <li>No material may be sold for less than its base price.</li>
                    </ul>

                    {/* Stage 3 */}
                    <h2 className="text-yellow-300 font-bold text-lg mb-2">Stage 3: City Auction</h2>
                    <ul className="list-decimal list-inside mb-4">
                        <li>Teams will bid for cities using their accumulated properties and tokens.</li>
                        <li>Properties that match a city's ideal type will receive the city-specific multiplier.</li>
                        <li>Properties that do not match will receive 1.5x the general multiplier.</li>
                        <li>If a team bids more than the tokens available in their balance, they will face immediate disqualification.</li>
                    </ul>
                </div>

                {/* Buttons */}
                <div className="flex gap-14">
                        <button onClick={() => router.push("/rules/raw-materials")} className="flex items-center bg-yellow-900 text-yellow-100 px-4 py-2 rounded hover:bg-yellow-800 transition-all duration-200">
                            RAW MATERIALS
                        </button>
                 
                        <button onClick={() => router.push("/rules/building-types")} className="flex items-center bg-yellow-900 text-yellow-100 px-4 py-2 rounded hover:bg-yellow-800 transition-all duration-200">
                            BUILDING TYPES
                        </button>

                        <button onClick={() => router.push("/rules/cities")} className="flex items-center bg-yellow-900 text-yellow-100 px-4 py-2 rounded hover:bg-yellow-800 transition-all duration-200">
                            CITIES
                        </button>
                </div>
            </div>
        </div>
    );
}
