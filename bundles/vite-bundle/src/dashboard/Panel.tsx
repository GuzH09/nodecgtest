import React, { useState, useEffect } from 'react';
// Helper hook for NodeCG replicants
type RedisMessage = { id: string; data: Record<string, string> };

function useReplicant<T>(name: string, defaultValue: T): T {
	const [val, setVal] = useState<T>(defaultValue);
	useEffect(() => {
		const rep = nodecg.Replicant<T>(name);
		const update = (newVal: T | undefined) => {
			setVal(newVal ?? defaultValue);
		};
		rep.on('change', update);
		return () => {
			rep.removeListener('change', update);
		};
	}, [name, defaultValue]);
	return val;
}

export function Panel() {
	const [count, setCount] = useState(0);
	const [isVisible, setIsVisible] = useState(true);
	const [currentTime, setCurrentTime] = useState(new Date());

	// NodeCG Replicants
	const streamLen = useReplicant<number>('redisStreamLen', 0);
	const messages = useReplicant<RedisMessage[]>('redisLatestMessages', []);

	// React-specific useEffect hook to update time every second
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	return (
		<>
			<p>Hello, I'm one of the panels in your bundle! I'm where you put your controls.</p>

			{/* React-specific interactive elements */}
			<div style={{ 
				padding: '10px', 
				margin: '10px 0', 
				border: '2px solid #007acc', 
				borderRadius: '8px',
				backgroundColor: isVisible ? '#f0f8ff' : '#ffe6e6'
			}}>
				<h3>React Functionality Test</h3>
				
				{/* State-based counter */}
				<div style={{ marginBottom: '10px' }}>
					<strong>Counter: {count}</strong>
					<button 
						onClick={() => setCount(count + 1)}
						style={{ marginLeft: '10px', padding: '5px 10px' }}
					>
						Increment
					</button>
					<button 
						onClick={() => setCount(0)}
						style={{ marginLeft: '5px', padding: '5px 10px' }}
					>
						Reset
					</button>
				</div>

				{/* Conditional rendering */}
				<div style={{ marginBottom: '10px' }}>
					<button 
						onClick={() => setIsVisible(!isVisible)}
						style={{ padding: '5px 10px' }}
					>
						{isVisible ? 'Hide' : 'Show'} Time
					</button>
					{isVisible && (
						<span style={{ marginLeft: '10px', fontFamily: 'monospace' }}>
							Current Time: {currentTime.toLocaleTimeString()}
						</span>
					)}
				</div>

				{/* Dynamic styling based on state */}
				<div style={{ 
					padding: '5px', 
					backgroundColor: count > 5 ? '#ffeb3b' : count > 0 ? '#4caf50' : '#f5f5f5',
					borderRadius: '4px',
					transition: 'background-color 0.3s ease'
				}}>
					Status: {count === 0 ? 'Ready' : count > 5 ? 'High Count!' : 'Counting...'}
				</div>
			</div>

			{/* Redis Stream Info */}
			<div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
				<h3>Redis Stream</h3>
				<p>Total Messages: {streamLen}</p>
				<ul style={{ maxHeight: '200px', overflowY: 'auto', listStyle: 'none', paddingLeft: 0 }}>
					{messages.map((msg) => (
						<li key={msg.id}>
							<strong>{msg.id}</strong>: {JSON.stringify(msg.data)}
						</li>
					))}
				</ul>
			</div>

			<p>
				To edit me, open "<span className="monospace">src/dashboard/Panel.tsx</span>" in your favorite text
				editor or IDE.
			</p>

			<p>
				You can use any libraries, frameworks, and tools you want. The only limit of panels is that they cannot
				render outside of their
				<span className="monospace">&lt;iframe&gt;</span>'s bounding box.
			</p>

			<p>
				Visit <a href="https://nodecg.dev" target="_blank" rel="noopener">https://nodecg.dev</a> for full
				documentation.
			</p>

			<p>You've got this!</p>
		</>
	)
}
